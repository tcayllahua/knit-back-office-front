# Copilot Instructions for Knit Back Office

## Project Overview
Knit Back Office es una aplicación web para la gestión integral de máquinas de tejer, construida con React, Vite, Material-UI y Supabase.

## Tech Stack
- **Frontend**: React 18 + Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: Zustand
- **API Queries**: React Query (TanStack Query)
- **Forms**: React Hook Form
- **Backend**: Supabase (Auth + Database + Storage)
- **Notifications**: Sonner
- **Image Processing**: browser-image-compression

## Key Features
1. **Authentication** - Login/Register con Supabase Auth
2. **Machine Management** - CRUD completo con DataGrid
3. **User Profile** - Editar perfil y subir foto
4. **Dashboard** - Estadísticas de máquinas
5. **Dark Mode** - Toggle tema con persistencia
6. **File Upload** - PDFs y fotos con validación

## Folder Structure

```
src/
├── config/           # Configuración de Supabase
├── store/            # Zustand stores
│   ├── authStore.js
│   ├── themeStore.js
│   └── machinesStore.js
├── hooks/            # React Query hooks
│   ├── queries.js    # useGetMachines, useGetMachine, etc.
│   └── mutations.js  # useCreateMachineMutation, etc.
├── components/       # Componentes reutilizables
│   ├── DashboardLayout.jsx  # Layout principal con AppBar/Sidebar
│   └── ProtectedRoute.jsx    # Wrapper de rutas protegidas
├── pages/            # Páginas (uno por ruta principal)
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── MaquinasPage.jsx      # Listado con DataGrid
│   ├── MaquinaFormPage.jsx   # Crear/Editar
│   └── MiPerfilPage.jsx
├── router.jsx        # Definición de rutas con React Router
├── theme.js          # Temas light/dark de MUI
├── App.jsx           # Componente raíz
└── main.jsx          # Punto de entrada
```

## Important Rules and Patterns

### 1. QueryClient
- **MUST** ser creado FUERA del componente App como constante del módulo
- Nunca dentro del render
- Configurar defaultOptions para staleTime y gcTime

### 2. Zustand Stores
- Separar estado UI de llamadas a Supabase en la estructura
- Mantener funciones async en el store para consistencia
- Usar middleware `persist` para persistencia en localStorage
- Ejemplo: `useThemeStore` usa persist, `useAuthStore` usa persist con partialize

### 3. React Query Hooks (Stack Pattern)
- `queries.js` - contiene todos los `useQuery` hooks
- `mutations.js` - contiene todos los `useMutation` hooks
- Cada mutation debe tener `onSuccess` e `onError`
- Usar `queryClient.invalidateQueries()` para invalidar caché
- Toast en onSuccess y onError

### 4. Environment Variables
- NUNCA hardcodear URLs de Supabase
- Siempre usar `import.meta.env.VITE_*`
- Crear `.env.local` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

### 5. File Validation
- Verificar tipo MIME antes de subir
- Validar tamaño (PDFs max 5MB)
- Comprimir imágenes con `browser-image-compression`

### 6. Error Handling
- Cada query/mutation debe tener manejo de errores
- Usar toast.error() de Sonner para notificaciones
- Validar en el cliente con React Hook Form
- Mostrar FormHelperText en campos con errores

### 7. Protected Routes
- Usar `<ProtectedRoute>` para todas las rutas que requieren auth
- Verificar `authenticated` y `user` del store
- Mostrar Loading mientras se verifica auth
- Redirigir a /login si no autenticado

### 8. Form Validation
- Usar React Hook Form con `useForm` hook
- Patrón de validación: email, requerido, minLength, custom
- Mostrar errores en `helperText` de TextField
- Deshabilitar botón submit con `isSubmitting`

### 9. Styling
- Usar `sx` prop de MUI para estilos inline
- Usar `theme.palette.mode` para modo oscuro
- Paleta de colores: primary, secondary, success, error, warning, info

### 10. Dark Mode
- Usar `useThemeStore` para obtener `darkMode`
- Usar `toggleDarkMode()` para cambiar
- Persistencia automática en localStorage
- Cambiar entre `lightTheme` y `darkTheme` en App.jsx

## Common Patterns

### Fetch Machine with Query
```javascript
const { data: machine, isLoading } = useGetMachine(id)
```

### Create/Update with Mutation
```javascript
const mutation = useCreateMachineMutation()
await mutation.mutateAsync({ machineData, pdfFile })
```

### Form with Validation
```javascript
const { register, handleSubmit, formState: { errors } } = useForm({
  defaultValues: { ... }
})
<TextField {...register('name', { required: 'Required' })} error={!!errors.name} />
```

### Protected Route
```javascript
<ProtectedRoute>
  <DashboardLayout />
</ProtectedRoute>
```

## Database Schema

### Tabla: usuarios
- id (BIGSERIAL PK)
- id_auth (UUID FK, references auth.users)
- email (UNIQUE)
- nombre, apellido
- telefono, direccion (OPTIONAL)
- foto_perfil (can be NULL)
- fecha_registro (DEFAULT NOW())
- timestamps

### Tabla: maquinas
- id (BIGSERIAL PK)
- nombre, marca, modelo (REQUIRED)
- numero_serie (UNIQUE)
- estado (CHECK: activa, inactiva, mantenimiento)
- fecha_adquisicion (OPTIONAL)
- ubicacion, descripcion (OPTIONAL)
- pdf_ficha_tecnica (can be NULL)
- timestamps

## Storage Buckets

1. **fichas-tecnicas** - Archivos PDF de máquinas
   - Path: `fichas-tecnicas/{id_maquina}`
   - Max size: 5MB
   - Accept: .pdf only

2. **usuarios** - Fotos de perfil
   - Path: `usuarios/{user_id}`
   - Max size: 1MB (after compression)
   - Accept: image/*

## Development Guidelines

### When Adding a Feature
1. Create/update stores first (Zustand)
2. Create query/mutation hooks (queries.js, mutations.js)
3. Create component or page
4. Update router if needed
5. Test with toast notifications

### When Fixing Bugs
1. Check console for errors
2. Verify Supabase credentials
3. Check RLS policies if DB issue
4. Verify file uploads with Storage browser
5. Check localStorage for persist

### When Optimizing
1. Look at React Query cache settings
2. Review component re-render patterns
3. Check Zustand selector usage (should return single values)
4. Verify index usage in DataGrid
5. Optimize images before upload

## Useful Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Type check
npm run type-check
```

## Troubleshooting

### Database Connection
1. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
2. Verify RLS policies allow queries
3. Check network tab for 401/403 errors
4. Ensure auth user exists for insert operations

### File Upload Fails
1. Check bucket exists and is public (for read)
2. Verify file type and size
3. Check storage RLS policies
4. Look at network tab upload request

### Auth Issues
1. Check localStorage for auth-storage
2. Verify email/password combination
3. Check user exists in auth.users table
4. Verify refresh token not expired

### Dark Mode Not Persistent
1. Check localStorage theme-storage
2. Verify persist middleware in themeStore
3. Check browser localStorage is enabled
4. Clear cache and try again
