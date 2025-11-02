import { Smartphone, Target, Rocket } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Smartphone,
      title: "Conecta tu WhatsApp",
      description: "Escanea el código QR y comienza a chatear con tu asistente personal en segundos.",
    },
    {
      number: "02",
      icon: Target,
      title: "Define tus objetivos",
      description: "Comparte tus metas por mensaje, audio o imagen. Tu asistente las organizará por ti.",
    },
    {
      number: "03",
      icon: Rocket,
      title: "Empieza a crecer",
      description: "Recibe recordatorios inteligentes y seguimiento automático de tu progreso diario.",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl mb-4 text-balance">
            {"Comienza en 3 simples pasos"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {"No necesitas descargar apps ni configuraciones complicadas. Todo sucede en WhatsApp."}
          </p>
        </div>

        <div className="grid gap-8 md:gap-12 lg:grid-cols-3 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}

              <div className="flex flex-col items-center text-center">
                {/* Step number */}
                <div className="mb-4 text-6xl font-bold text-primary/10 leading-none">{step.number}</div>

                {/* Icon */}
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 -mt-12 relative z-10 border-4 border-background">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
            {"Comenzar ahora gratis"}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="mt-4 text-sm text-muted-foreground">{"Sin tarjeta de crédito • Configuración en 2 minutos"}</p>
        </div>
      </div>
    </section>
  )
}
