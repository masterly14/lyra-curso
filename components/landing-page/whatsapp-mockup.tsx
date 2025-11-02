import { Check, Mic, Paperclip, Smile } from "lucide-react"

export function WhatsAppMockup() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Phone Frame */}
      <div className="relative rounded-[2.5rem] border-8 border-foreground/10 bg-background shadow-2xl overflow-hidden">
        {/* WhatsApp Header */}
        <div className="bg-primary px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">{"AI"}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-primary-foreground font-semibold text-sm">{"Tu Asistente IA"}</h3>
            <p className="text-primary-foreground/80 text-xs">{"en línea"}</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-muted/30 p-4 space-y-3 min-h-[400px]">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="bg-primary text-primary-foreground rounded-lg rounded-tr-sm px-4 py-2 max-w-[80%]">
              <p className="text-sm">{"Quiero hacer ejercicio 3 veces por semana"}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-xs opacity-70">{"10:23"}</span>
                <Check className="h-3 w-3 opacity-70" />
              </div>
            </div>
          </div>

          {/* AI Response */}
          <div className="flex justify-start">
            <div className="bg-card text-card-foreground rounded-lg rounded-tl-sm px-4 py-2 max-w-[80%] shadow-sm">
              <p className="text-sm">
                {"¡Excelente meta! 💪 Te ayudaré a mantener el ritmo. ¿Qué días prefieres entrenar?"}
              </p>
              <span className="text-xs text-muted-foreground mt-1 block">{"10:23"}</span>
            </div>
          </div>

          {/* User Message */}
          <div className="flex justify-end">
            <div className="bg-primary text-primary-foreground rounded-lg rounded-tr-sm px-4 py-2 max-w-[80%]">
              <p className="text-sm">{"Lunes, miércoles y viernes"}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-xs opacity-70">{"10:24"}</span>
                <Check className="h-3 w-3 opacity-70" />
              </div>
            </div>
          </div>

          {/* AI Response with Action */}
          <div className="flex justify-start">
            <div className="bg-card text-card-foreground rounded-lg rounded-tl-sm px-4 py-2 max-w-[80%] shadow-sm">
              <p className="text-sm">
                {
                  "Perfecto! ✅ He configurado recordatorios para esos días a las 7:00 AM. También conecté tu calendario para evitar conflictos."
                }
              </p>
              <div className="mt-2 p-2 bg-accent rounded text-xs">
                <p className="font-semibold text-accent-foreground">{"🎯 Meta creada"}</p>
                <p className="text-accent-foreground/80">{"Ejercicio • 3x semana"}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">{"10:24"}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Input */}
        <div className="bg-background border-t border-border px-3 py-2 flex items-center gap-2">
          <Smile className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1 bg-muted rounded-full px-4 py-2">
            <p className="text-sm text-muted-foreground">{"Escribe un mensaje"}</p>
          </div>
          <Paperclip className="h-5 w-5 text-muted-foreground" />
          <div className="bg-primary rounded-full p-2">
            <Mic className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Floating Badge */}
      <div className="absolute -right-4 top-1/4 bg-secondary text-secondary-foreground rounded-full px-4 py-2 shadow-lg rotate-12 transform">
        <p className="text-xs font-semibold">{"100% en WhatsApp"}</p>
      </div>
    </div>
  )
}
