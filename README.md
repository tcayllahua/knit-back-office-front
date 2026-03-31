# Knit Back Office - Gestión de Máquinas de Tejer

Aplicación web de back office para la gestión de máquinas de tejer, con autenticación, perfiles de usuario y CRUD completo de máquinas.

## Características

- 🔐 Autenticación con Supabase
- 👤 Gestión de perfiles de usuario con fotos
- 🏭 CRUD completo de máquinas de tejer
- 📊 Dashboard con estadísticas
- 🌙 Tema claro/oscuro
- 📱 Diseño responsive
- 📄 Subida de fichas técnicas en PDF
- 🔒 Rutas protegidas

## Requisitos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase

## Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd knit-back-office-front
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Copiar `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```

Llenar las variables:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Configurar Base de Datos

1. Ir a Supabase console
2. Crear proyecto (si no existe)
3. Ir a SQL Editor
4. Ejecutar el contenido de `database-schema.sql`
5. Crear dos buckets en Storage:
   - `fichas-tecnicas` - para PDFs de máquinas
   - `usuarios` - para fotos de perfil

### 5. Iniciar desarrollo

```bash
npm run dev
```

La aplicación estará disponible en http://localhost:5173

## Estructura del Proyecto

```
src/
├── config/           # Configuración (Supabase)
├── store/            # Zustand stores (auth, theme, machines)
├── hooks/            # React Query hooks (queries, mutations)
├── components/       # Componentes reutilizables
├── pages/            # Páginas principales
├── theme.js          # Configuración de Material-UI
├── router.jsx        # Definición de rutas
├── App.jsx           # Componente principal
└── main.jsx          # Entrada de la app
```

## Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Preview de build
- `npm run lint` - Ejecuta linter
- `npm run type-check` - Verificar tipos

## Flujo de Autenticación

1. **Login**: Usuarios inician sesión con email y contraseña
2. **Registro**: Nuevos usuarios se registran y se crea su perfil
3. **ProtectedRoute**: Las rutas protegidas verifican autenticación
4. **Persistencia**: El estado de auth se persiste en localStorage

## Gestión de Máquinas

### Crear máquina
- Ir a "Máquinas" → "Nueva Máquina"
- Llenar formulario con datos de la máquina
- (Opcional) Subir ficha técnica en PDF (max 5MB)
- Guardar

### Editar máquina
- Ir a "Máquinas"
- Click en icono "Editar" en la fila
- Actualizar datos
- Guardar

### Eliminar máquina
- Ir a "Máquinas"
- Click en icono "Eliminar"
- Confirmar eliminación

### Filtros y búsqueda
- Buscar por nombre o número de serie
- Filtrar por estado (Activa, Inactiva, Mantenimiento)

## Gestión de Perfil

- Acceder via avatar en AppBar → "Mi perfil"
- Actualizar datos personales
- Subir/cambiar foto de perfil (se comprime automáticamente)
- Email y fecha de registro se muestran como lectura

## Tecnologías

- **Frontend**: React 18
- **Build**: Vite
- **UI**: Material-UI (MUI)
- **Forms**: React Hook Form
- **Estado**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Backend**: Supabase
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Notificaciones**: Sonner
- **Compression**: browser-image-compression

## Patrones y Convenciones

- **QueryClient**: Creado fuera del componente App
- **Stores**: Zustand con middleware persist
- **Mutations**: Stack files encapsulan React Query
- **Validación**: React Hook Form en todos los formularios
- **Toast**: Sonner para notificaciones
- **Tema**: Persistencia en localStorage

## Localización

La aplicación está en español con capacidad de expandir a otros idiomas.

## Licencia

MIT
