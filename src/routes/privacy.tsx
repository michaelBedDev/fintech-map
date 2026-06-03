import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <header className='flex items-center gap-3 px-6 py-3 border-b border-border bg-card'>
        <Link to='/'>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
        </Link>
        <h1 className='text-xl font-bold tracking-tight'>Política de Privacidad</h1>
      </header>

      <main className='max-w-2xl mx-auto px-6 py-10 space-y-8 text-sm leading-relaxed'>
        <p className='text-muted-foreground'>
          Última actualización: 24 de febrero de 2025
        </p>

        <section className='space-y-2'>
          <h2 className='text-lg font-semibold'>1. Responsable del Tratamiento</h2>
          <p>
            El responsable de los datos recogidos en este sitio web es{" "}
            <strong>Miguel Caamaño Martínez</strong>, con contacto en{" "}
            <a
              href='mailto:miguelcaamanomartinez@gmail.com'
              className='text-primary underline underline-offset-2'>
              miguelcaamanomartinez@gmail.com
            </a>
            .
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-lg font-semibold'>2. Datos que recabamos</h2>
          <p>
            Para el funcionamiento de la aplicación, tratamos los siguientes datos:
          </p>
          <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
            <li>
              <strong className='text-foreground'>
                Identificador de X (Twitter):
              </strong>{" "}
              Nombre de usuario (@handle) y nombre público facilitado por el
              proveedor a través de OAuth. Ejemplo: MichaelBed💻🐍🤖 @iammicama.
              (x.com)
            </li>
            <li>
              <strong className='text-foreground'>Datos de Preferencias:</strong> La
              provincia que selecciones manualmente dentro de la aplicación.
            </li>
          </ul>
        </section>

        <section className='space-y-2'>
          <h2 className='text-lg font-semibold'>3. Finalidad del tratamiento</h2>
          <p>Los datos se utilizan exclusivamente para:</p>
          <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
            <li>
              Vincular tu perfil de usuario a una ubicación geográfica en nuestro
              mapa interactivo.
            </li>
            <li>Permitir el inicio de sesión y mantener tu sesión activa.</li>
            <li>
              Mostrar tu nombre de usuario público en las secciones correspondientes
              de la herramienta.
            </li>
          </ul>
        </section>

        <section className='space-y-2'>
          <h2 className='text-lg font-semibold'>4. Base Legal</h2>
          <p>
            La base legal para este tratamiento es el{" "}
            <strong>consentimiento del usuario</strong> al iniciar sesión a través de
            X y utilizar las funcionalidades de la aplicación de forma voluntaria.
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-lg font-semibold'>5. Conservación de los datos</h2>
          <p>
            Tus datos se conservarán mientras mantengas tu cuenta activa. Si decides
            solicitar la eliminación de tus datos, procederemos a borrarlos de
            nuestra base de datos en Supabase.
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-lg font-semibold'>6. Destinatarios (Terceros)</h2>
          <p>
            No vendemos ni cedemos tus datos a terceros. Sin embargo, utilizamos
            servicios de infraestructura que actúan como encargados del tratamiento:
          </p>
          <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
            <li>
              <strong className='text-foreground'>Supabase:</strong> Para el
              almacenamiento de la base de datos y gestión de autenticación.
            </li>
            <li>
              <strong className='text-foreground'>Vercel:</strong> Para el
              alojamiento de la plataforma.
            </li>
          </ul>
          <p>
            Ambos proveedores garantizan niveles de seguridad adecuados según los
            marcos de privacidad vigentes (Data Privacy Framework)
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-lg font-semibold'>7. Tus Derechos (Derechos ARCO)</h2>
          <p>
            Puedes ejercer tus derechos de <strong>acceso</strong>,{" "}
            <strong>rectificación</strong>, <strong>supresión</strong> o{" "}
            <strong>limitación</strong> enviando un correo electrónico a{" "}
            <a
              href='mailto:miguelcaamanomartinez@gmail.com'
              className='text-primary underline underline-offset-2'>
              miguelcaamanomartinez@gmail.com
            </a>
            . También puedes revocar el acceso de esta aplicación desde la
            configuración de seguridad de tu cuenta de X (Twitter).
          </p>
          <p>
            Además, puedes eliminar tu cuenta y todos los datos asociados
            directamente desde la aplicación usando el botón{" "}
            <strong>"Eliminar mi cuenta"</strong> disponible en el menú de usuario.
          </p>
        </section>

        <div className='pt-4 border-t border-border'>
          <Link to='/'>
            <Button variant='outline' className='gap-2'>
              <ArrowLeft className='h-4 w-4' />
              Volver al mapa
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
