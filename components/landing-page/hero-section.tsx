import { Button } from "@/components/ui/button"
import { MessageCircle, Sparkles, Target } from "lucide-react"
import { WhatsAppMockup } from "./whatsapp-mockup"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 self-center lg:self-start rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
              <Sparkles className="h-4 w-4" />
              <span>{"Impulsado por IA"}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl text-balance">
              {"Alcanza tus metas directamente desde "}
              <span className="text-primary">{"WhatsApp"}</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-muted-foreground sm:text-xl md:text-2xl leading-relaxed text-pretty">
              {
                "Tu asistente personal de IA que te ayuda a trackear objetivos, recibir recordatorios inteligentes y mantener el enfoque. Todo sin salir de tu app favorita."
              }
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span>{"Audio, texto e imágenes"}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                <Target className="h-4 w-4 text-secondary" />
                <span>{"Recordatorios inteligentes"}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-4 justify-center lg:justify-start mt-4">
              <Button size="lg" className="text-base font-semibold h-12 px-8">
                {"Comenzar gratis"}
              </Button>
              <Button size="lg" variant="outline" className="text-base font-semibold h-12 px-8 bg-transparent">
                {"Ver cómo funciona"}
              </Button>
            </div>

            {/* Social Proof */}
            <p className="text-sm text-muted-foreground">{"✨ Sin tarjeta de crédito • Configuración en 2 minutos"}</p>
          </div>

          {/* Right Column - Visual */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <WhatsAppMockup />
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full bg-secondary/5 blur-3xl" />
      </div>
    </section>
  )
}
