# Project Lyra - Backend Architecture Overview

## 1. Project Overview

This document details the backend architecture for Project Lyra, an AI-powered assistant that helps users manage their goals and reminders via WhatsApp. The system is designed to understand natural language, interact with the user's calendar, and provide a seamless conversational experience.

## 2. Core Technologies

- **Framework**: Next.js (App Router for API Routes and Serverless Functions)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk for user management and session control
- **Messaging**: WhatsApp Cloud API for sending and receiving messages
- **Calendar Integration**: Composio for abstracting Google Calendar OAuth and API interactions
- **Scheduled Jobs & Queues**: Upstash QStash for delayed message delivery (reminders)
- **In-Memory Storage**: Upstash Redis for short-term conversation memory
- **AI & Language Processing**:
  - OpenAI (Whisper for audio, GPT-4o-mini for text, GPT-4o Vision for images)
  - LangChain.js & LangGraph for orchestrating conversational flows and tool usage

---

## 3. Architecture & Data Flow

The backend is composed of several interconnected services that handle different parts of the user journey, from onboarding to daily interaction.

### 3.1. Onboarding & Verification Flow

This flow ensures the user is authenticated and their communication channels (WhatsApp, Calendar) are connected.

1.  **User Registration (Clerk)**: The user signs up on the frontend. Clerk handles the authentication and a corresponding `User` record is created in our database via the `createOrValidateUser` server action.
2.  **Phone Verification (OTP)**:
    - The frontend prompts the user to enter their phone number.
    - A request is made to `POST /api/otp/send`.
    - This endpoint:
      - Generates a 6-digit One-Time Password (OTP).
      - Stores it in the `PhoneVerification` table with an expiration time.
      - Uses `lib/whatsapp.ts` to send the OTP to the user's WhatsApp via a template message.
    - The user enters the OTP on the frontend.
    - A request is made to `POST /api/otp/verify`.
    - This endpoint validates the code against the `PhoneVerification` record and, upon success, creates a `WhatsAppAccount` record, linking the user's ID to their verified phone number.
3.  **Calendar Connection (Composio)**:
    - After phone verification, the user is prompted to connect their calendar.
    - The frontend calls `POST /api/composio/connect`.
    - This endpoint uses the Composio SDK (`lib/composio.ts`) to initiate an OAuth2 flow for Google Calendar and returns a `redirectUrl`.
    - The user is redirected to the Google Consent screen and authorizes the application.
    - Upon completion, Composio sends a webhook to `POST /api/webhooks/composio`.
    - This webhook handler creates a `CalendarAccount` record, linking the user's ID to their Composio connection ID.

### 3.2. Conversational Message Processing Flow

This is the core loop for handling user interactions via WhatsApp.

1.  **Incoming Message (Webhook)**:
    - A user sends a message (text, audio, or image) to the assistant's WhatsApp number.
    - The WhatsApp Cloud API forwards this message to our webhook at `POST /api/whatsapp/webhook/route.ts`.
    - The webhook first verifies the `x-hub-signature-256` to ensure the request is from Meta.
    - It saves a record of the incoming message in the `Message` table for history and debugging.
2.  **Message Processing Pipeline**:
    - The webhook then calls `processMessagePipeline` (`lib/messagePipeline.ts`).
    - This function is the entry point to our AI logic:
      - **Audio**: If the message is audio, it's sent to OpenAI Whisper (`lib/openai.ts`) for transcription.
      - **Text/Image**: The resulting text (or image data) is prepared for the next step.
    - Finally, it calls `runGraph(phone, text)`, passing the user's phone number and the message content.
3.  **LangGraph Agent Execution**:
    - `runGraph` (`lib/langgraph.ts`) invokes our conversational agent, which is structured as a state machine (a graph).
    - **START**: The flow begins.
    - **`loadHistory` Node**: It retrieves the recent conversation history for that user from Redis (`history:{phone}`). This provides context for the AI.
    - **`llmCall` Node**: The user's new message, along with the history, is sent to the AI model (`gpt-4o-mini`). The model is "bound" with a set of available tools (`create_task`, `list_tasks`).
    - **Conditional Edge**: The graph checks the model's output.
      - If the model decides to use a tool, the flow is routed to the `toolNode`.
      - If the model can answer directly, the flow proceeds to the `END`.
    - **`toolNode`**: This node executes the tool chosen by the AI.
      - `create_task`: Creates a `Task` record in the database, uses `lib/calendar.ts` to create a Google Calendar event via Composio, and uses `lib/qstash.ts` to schedule a reminder notification.
      - `list_tasks`: Queries the database for the user's pending tasks.
    - The output of the tool is sent back to the `llmCall` node for the AI to formulate a human-readable response (e.g., "OK, I've scheduled your meeting.").
    - **END**: The final response is generated.
4.  **Sending the Response**:
    - The `runGraph` function receives the final message from the agent.
    - It saves the complete updated conversation history back to Redis for the next interaction.
    - It uses `sendTextMessage` from `lib/whatsapp.ts` to send the response to the user.

### 3.3. Scheduled Reminders Flow

1.  **QStash Trigger**: When a task is created, a delayed message is scheduled in Upstash QStash, set to trigger a few minutes before the task's due time.
2.  **QStash Webhook**: At the scheduled time, QStash sends a request to our webhook at `POST /api/webhooks/qstash/route.ts`.
3.  **Reminder Logic**:
    - The webhook handler receives the `taskId`.
    - It fetches the task and the user's associated `WhatsAppAccount` to get their phone number.
    - It sends the reminder message (e.g., "🔔 Reminder: Team Meeting") via `lib/whatsapp.ts`.
    - It updates the `Task` status to `SENT`.

---

## 4. Key Components (File Breakdown)

-   `/prisma/schema.prisma`: Defines the entire database schema, including users, subscriptions, tasks, and verification tables.
-   `/app/api/**/*.ts`: Contains all public-facing API endpoints and webhooks.
    -   `/otp/`: Handles sending and verifying phone numbers.
    -   `/composio/`: Manages the calendar connection flow.
    -   `/tasks/`: A manual endpoint for creating tasks (can be used by the frontend).
    -   `/webhooks/`: Receives events from external services (WhatsApp, Composio, QStash).
-   `/lib/`: Contains core business logic, helpers, and SDK initializations.
    -   `db.ts`: Prisma client instance.
    -   `redis.ts`: Redis client instance.
    -   `whatsapp.ts`: Helpers for sending messages via WhatsApp Cloud API.
    -   `composio.ts` / `calendar.ts`: Composio SDK and calendar-related functions.
    -   `qstash.ts`: Helper for scheduling jobs with QStash.
    -   `openai.ts`: Wrappers for OpenAI API calls (Whisper, GPT).
    -   `messagePipeline.ts`: Entry point orchestrator for incoming messages.
    -   `langgraph.ts`: The core conversational agent logic, including state, nodes, and tools.

## Variables de entorno necesarias

| Nombre | Descripción |
|--------|-------------|
| NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN | Token de acceso de WhatsApp Cloud (lado cliente) |
| NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID | ID del número de WhatsApp (cliente) |
| NEXT_PUBLIC_WHATSAPP_WEBHOOK_SECRET | Secreto para verificar el webhook de WhatsApp |
| WHATSAPP_ACCESS_TOKEN | Token de acceso (servidor) |
| WHATSAPP_PHONE_NUMBER_ID | ID del número (servidor) |
| COMPOSIO_API_KEY | API Key de Composio |
| NEXT_PUBLIC_COMPOSIO_AUTH_CONFIG_ID | ID del Auth Config para el calendario |
| QSTASH_TOKEN | Token de Upstash QStash |
| QSTASH_SIGNING_KEY | Clave para verificar las firmas de QStash |
| REDIS_REST_URL / REDIS_REST_TOKEN | Credenciales de Upstash Redis |
| OPENAI_API_KEY | Clave de API de OpenAI |
| NEXT_PUBLIC_APP_URL | URL pública de la app (https://miapp.com) |

## Flujo de usuario (MVP)

1. El usuario se registra con Clerk desde la landing.
2. Al validar su suscripción es redirigido a **/platform/dashboard**.
3. Si no tiene teléfono verificado aparece el **Modal OTP**:
   - Introduce su número → se envía plantilla de WhatsApp con código.
   - Introduce OTP → el número queda verificado.
4. Conecta su calendario pulsando **Conectar Calendario** (OAuth de Composio).
5. Envía un mensaje a WhatsApp, por ej.: «Recuérdame enviar el reporte mañana a las 9am».
6. Webhook de WhatsApp:
   - Verifica la firma.
   - Transcribe audio si aplica (Whisper).
   - GPT-4o-mini extrae la intención `{ "intent":"create_task", "title":"enviar el reporte", "date":"2025-11-01T09:00:00" }`.
   - Crea la **Task** en la base de datos y agenda el recordatorio con QStash.
   - Responde al usuario: «Tarea creada: enviar el reporte».
7. A la hora indicada QStash invoca su webhook → se envía recordatorio por WhatsApp y la tarea cambia a **SENT**.
8. El dashboard muestra en tiempo real:
   - Total de tareas
   - Completadas
   - % Puntualidad
