# finXMap 🇪🇸 🇦🇩

¡Bienvenido a **finXMap**! Una aplicación web interactiva que conecta a la comunidad de desarrolladores y usuarios de X/Twitter en España y Andorra a través de un mapa interactivo y canales de chat locales y globales.

Este es un proyecto open-source construido con un stack moderno de desarrollo web. A continuación, encontrarás toda la información necesaria para configurar el entorno de desarrollo local, gestionar la base de datos con Supabase y contribuir al proyecto.

---

## 🛠️ Stack Tecnológico

El proyecto está construido utilizando las siguientes herramientas:
* **Frontend:** React 19, TypeScript, Vite, TailwindCSS (v4)
* **Mapa:** Leaflet & React-Leaflet
* **Gestión de Estado y Rutas:** TanStack Router (File-based) & TanStack Query (v5)
* **Backend as a Service (BaaS):** Supabase (PostgreSQL, Auth, Realtime, RLS)
* **Gestor de Paquetes:** pnpm

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu máquina:
1. **Node.js** (versión 18 o superior recomendada).
2. **pnpm** (gestor de paquetes por defecto del proyecto).
3. **Docker Desktop** o Docker Engine corriendo en segundo plano (necesario para la base de datos local de Supabase).

---

## 🚀 Guía de Instalación Local

Sigue estos pasos para clonar el repositorio e iniciar tu entorno local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/finXMap.git
cd finXMap
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Configurar variables de entorno
Crea un archivo llamado `.env.local` en la raíz del proyecto y copia las siguientes variables. (Una vez que inicies Supabase local en el paso siguiente, se te proporcionarán los valores exactos):

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase_local
```

---

## ⚡ Levantando Supabase Local

El proyecto gestiona la base de datos y la autenticación localmente usando la CLI de Supabase integrada.

### 1. Iniciar los servicios de Supabase (Requiere Docker activo)
```bash
npx supabase start
```
*Este comando descargará e iniciará las imágenes Docker necesarias de PostgreSQL, Supabase Studio, Auth, etc.*

Al finalizar, la consola te mostrará una lista de URLs y claves. Copia la **API URL** (habitualmente `http://127.0.0.1:54321`) y la **anon key** en tu archivo `.env.local`.

### 2. Aplicar migraciones y datos semilla (Seeds)
Para aplicar las tablas, políticas de seguridad RLS, triggers e insertar los 150 usuarios simulados en el mapa, ejecuta:
```bash
pnpm db:reset
```
*(Equivale a correr `npx supabase db reset`)*

### 3. Generar Tipos de TypeScript de la Base de Datos
Cada vez que actualices el esquema, puedes regenerar los tipos estáticos para mantener la coherencia de tipos en el frontend:
```bash
pnpm update-types
```

### 🔧 URLs Útiles de Supabase Local
* **Supabase Studio (Consola local):** `http://127.0.0.1:54323` (Usuario/Contraseña por defecto: `postgres`/`postgres`)

---

## 💻 Ejecutar la Aplicación Web

Una vez que Supabase esté levantado y configurado en tu `.env.local`, inicia el servidor de desarrollo del frontend:

```bash
pnpm dev
```

La aplicación estará lista y accesible en `http://localhost:3000`.

---

## 💾 Guía de Desarrollo de Base de Datos (Migraciones)

Todas las modificaciones de base de datos deben realizarse mediante migraciones de código SQL ordenadas cronológicamente en el directorio `./supabase/migrations`. **Nunca edites tablas directamente desde el panel de Supabase Studio local sin generar una migración.**

### 1. Crear una nueva migración
```bash
pnpm migration:new nombre_descriptivo_de_tu_cambio
```
*(Equivale a `npx supabase migration new <nombre>`)*

Esto creará un archivo `.sql` vacío en `supabase/migrations/` con una marca de tiempo. Escribe tus sentencias SQL (DCL, DDL, RLS) allí.

### 2. Aplicar los cambios localmente
Para aplicar la nueva migración en tu base de datos local de desarrollo:
```bash
pnpm db:reset
```

### 3. Generar migraciones automáticamente mediante diferencias (Opcional)
Si has realizado cambios de manera interactiva a través del Supabase Studio local, puedes generar una migración de diferencias ejecutando:
```bash
pnpm migration:diff nombre_del_archivo
```

---

## ⚙️ Scripts de Desarrollo (`package.json`)

El proyecto incluye los siguientes scripts para simplificar el flujo de desarrollo:

* **Frontend y Desarrollo:**
  - `pnpm dev`: Inicia el servidor de desarrollo local para el frontend con Vite en `http://localhost:3000`.
  - `pnpm build`: Compila la aplicación y genera los assets de producción en la carpeta `dist/`.
  - `pnpm preview`: Arranca un servidor web local para previsualizar los archivos de producción generados en `dist/`.

* **Pruebas (Tests):**
  - `pnpm test`: Ejecuta la suite de pruebas unitarias y de integración de Vitest una única vez.
  - `pnpm test:coverage`: Ejecuta la suite de pruebas y genera un informe de cobertura detallado.

* **Base de Datos (Supabase local):**
  - `pnpm migration:new <nombre>`: Crea un archivo `.sql` de migración en blanco bajo `./supabase/migrations/` con una marca de tiempo.
  - `pnpm migration:diff <nombre>`: Genera una migración automática calculando las diferencias entre tu base de datos local y los archivos de migración existentes.
  - `pnpm db:reset`: Borra y recrea la base de datos local, aplicando de nuevo todas las migraciones y ejecutando los scripts semilla (`seed.sql`).
  - `pnpm update-types`: Genera de forma local las definiciones de tipos estáticos de TypeScript de la base de datos directamente en [database.types.ts](file:///media/miguel/SSD_Games/Repos_Github/Linux/finXMap/src/types/database.types.ts).

---

## 🧪 Pruebas y Cobertura de Código (Coverage)

Utilizamos **Vitest** y **v8** para la ejecución y reporte de cobertura de pruebas en la lógica de negocio (servicios, utilidades, helpers y constantes).

### ¿Cómo ver la cobertura?

1. **Ejecutar el reporte de cobertura en consola:**
   Corre el siguiente comando para ver la tabla resumen de la cobertura en tu terminal:
   ```bash
   pnpm test:coverage
   ```
   *Esto evaluará que se alcancen los umbrales de cobertura configurados (mínimo 90% en la lógica de negocio).*

2. **Inspección visual interactiva en el navegador:**
   Vitest genera automáticamente un informe HTML detallado bajo la carpeta `/coverage`. Puedes abrirlo para ver de manera interactiva exactamente qué líneas o ramas del código están siendo cubiertas por las pruebas:
   ```bash
   # Inicia la interfaz interactiva de Vitest
   pnpm exec vitest --ui
   ```
   *(Alternativamente, puedes hacer doble clic en el archivo local `coverage/index.html` para abrirlo directamente en Firefox).*

---

## 🤝 Cómo Contribuir (PRs y Buenas Prácticas)

¡Nos encanta recibir contribuciones! Para mantener la calidad del código, por favor sigue estas directrices:

### 1. Flujo de Trabajo con Git
1. Haz un **fork** del repositorio y crea tu rama a partir de `main`:
   ```bash
   git checkout -b feature/nombre-de-la-funcionalidad
   # o
   git checkout -b bugfix/nombre-del-error
   ```
2. Realiza tus commits siguiendo convenciones claras (ej. [Conventional Commits](https://www.conventionalcommits.org/)):
   - `feat: agregar componente de perfil`
   - `fix: resolver reconexión de websocket en chat`
3. Sube tus cambios y abre un **Pull Request** detallando el propósito del cambio y los problemas que resuelve.

### 2. Buenas Prácticas de Desarrollo en este Proyecto
* **React Hooks y Rendimiento:** Cuando utilices callbacks o suscripciones en hooks personalizados (por ejemplo, en realtime), asegúrate de memoizar las dependencias con `useCallback` y utilizar referencias mutables (`useRef`) donde sea necesario para evitar suscripciones redundantes o re-renderizados infinitos de red.
* **Consistencia en Mutaciones:** Las funciones de mutación de TanStack Query deben evaluar el objeto de resultado devuelto por los servicios de Supabase (`{ success, error }`). Si la operación falla en base de datos, debes lanzar un `Error` explícito para que `onError` en el cliente reaccione y muestre las notificaciones/toasts adecuadamente.
* **Seguridad (RLS):** Toda nueva tabla debe habilitar Row Level Security (RLS) en sus archivos de migración y definir políticas adecuadas (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) vinculadas a `auth.uid()`.
