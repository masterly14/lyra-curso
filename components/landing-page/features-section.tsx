import { Calendar, BarChart3, Bell, MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function FeaturesSection() {
  const features = [
    {
      icon: MessageSquare,
      title: "Interacción Natural",
      description: "Envía mensajes, audios o imágenes. Tu asistente entiende todo.",
    },
    {
      icon: Bell,
      title: "Recordatorios Inteligentes",
      description: "Notificaciones personalizadas que se adaptan a tu rutina.",
    },
    {
      icon: Calendar,
      title: "Sincronización de Calendario",
      description: "Conecta tu agenda y evita conflictos automáticamente.",
    },
    {
      icon: BarChart3,
      title: "Dashboard de Progreso",
      description: "Visualiza tus métricas y celebra cada logro alcanzado.",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl mb-4 text-balance">
            {"Todo lo que necesitas para crecer"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {"Herramientas poderosas diseñadas para ayudarte a mantener el enfoque y alcanzar tus objetivos."}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
