import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <header className='flex items-center gap-3 px-6 py-3 border-b border-border bg-card'>
        <Link to='/'>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
        </Link>
        <h1 className='text-xl font-bold tracking-tight'>Sobre FinXMap</h1>
      </header>

      <main className='max-w-2xl mx-auto px-6 py-10 space-y-8 text-sm leading-relaxed'>
        <section className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Heart className='h-5 w-5 text-rose-400' />
            <h2 className='text-lg font-semibold'>Para la comunidad</h2>
          </div>
          <p>
            <strong>FinXMap</strong> nació como un proyecto para la comunidad de{" "}
            <strong>X (Twitter)</strong>, todo gracias a la idea de{" "}
            <a
              href='https://x.com/ZenAccion'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary underline underline-offset-2'>
              @ZenAccion
            </a>
          </p>
          <p>
            La idea es simple: poder ver en un mapa dónde están los miembros de
            nuestra comunidad, descubrir quién está cerca de ti y conectar con gente
            que comparte tus intereses.
          </p>
        </section>

        <section className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Twitter className='h-5 w-5 text-sky-400' />
            <h2 className='text-lg font-semibold'>¿Cómo nació esto?</h2>
          </div>
          <p>
            Todo empezó con una pregunta que seguro te has hecho alguna vez:{" "}
            <em>¿habrá alguien de mi zona en esta comunidad?</em> Pues aquí tienes la
            respuesta. Regístrate, elige tu provincia y aparecerás en el mapa.
          </p>
          <p>
            El proyecto es <strong>completamente gratuito y open source</strong>. No
            hay publicidad, no hay rastreo, no hay trampas. Solo un mapa y una
            comunidad.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='text-lg font-semibold'>Créditos</h2>
          <p>
            Desarrollado por{" "}
            <a
              href='https://x.com/iammicama'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary underline underline-offset-2'>
              @iammicama
            </a>
            . Si tienes ideas, sugerencias o simplemente quieres saludar, mándame un
            DM. Esto lo hacemos entre todos.
          </p>
        </section>

        <div className='border-t border-border pt-6 text-center text-muted-foreground text-xs'>
          Hecho con ❤️ para la comunidad de FinX
        </div>
      </main>
    </div>
  );
}
