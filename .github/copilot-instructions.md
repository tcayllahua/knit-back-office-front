# Knit Back Office — Guía del Proyecto

Knit Back Office: gestión de máquinas de tejer. React 18 + Vite, MUI, Zustand, React Query, Supabase.
Ver [README.md](../README.md) para características/instalación, [SETUP.md](../SETUP.md) para onboarding, [database-schema.sql](../database-schema.sql) para el esquema completo.

## Compilar y Probar

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo Vite (localhost:5173)
npm run build        # Build de producción
npm run lint         # ESLint con auto-fix
npm run type-check   # Validación TypeScript
```

## Arquitectura

```
src/
├── config/supabase.js          # Cliente Supabase (env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
├── store/                      # Stores Zustand (authStore, themeStore, machinesStore)
├── hooks/queries.js            # Todos los hooks useQuery (uno por entidad)
├── hooks/mutations.js          # Todos los hooks useMutation (CRUD + importación masiva)
├── components/                 # DashboardLayout (AppBar+Drawer+Outlet), ProtectedRoute
├── pages/                      # Una página por ruta: listado (*Page.jsx) + formulario (*FormPage.jsx)
├── router.jsx                  # React Router v6 — rutas públicas + protegidas bajo DashboardLayout
├── theme.js                    # Temas MUI claro/oscuro
└── App.jsx                     # Stack de providers: QueryClientProvider > ThemeProvider > RouterProvider > Toaster
```

**Entidades**: máquinas (machine_parameters), parámetros de prenda, parámetros de tejido, parámetros de material, hilos, proveedores, configuraciones HQPDS, usuarios. Todas las tablas de parámetros tienen FK a `hqpds_configurations` con `ON DELETE CASCADE`.

**Almacenamiento**: Bucket único `kinit-files-01` para todos los archivos (imágenes, PDFs). Ver [storage-policies.sql](../storage-policies.sql).

## Convenciones

### Capa de Datos (CRÍTICO — seguir estos patrones exactamente)
- **QueryClient** debe crearse como constante a nivel de módulo fuera de cualquier componente (ver `App.jsx`)
- **Todas las queries** van en `src/hooks/queries.js` — patrón de keys: `['nombre-entidad']` o `['nombre-entidad', id]`
- **Todas las mutations** van en `src/hooks/mutations.js` — cada mutation debe:
  1. Usar una función `buildPayload()` para normalizar datos (trim strings, convertir números, manejar nulls)
  2. Llamar `queryClient.invalidateQueries()` en éxito
  3. Mostrar `toast.success()` / `toast.error()` vía Sonner
- **Importaciones masivas** (hilos, proveedores) usan `xlsx` con normalización de headers para manejar variaciones de ortografía/acentos

### Gestión de Estado
- Stores Zustand con middleware `persist` para localStorage (`auth-storage`, `theme-storage`)
- `authStore` usa `partialize` para persistir solo campos específicos
- Las llamadas async a Supabase viven dentro de acciones del store (ej: `machinesStore.createMachine()`)

### Páginas
- **Páginas de listado**: MUI DataGrid con búsqueda/filtros, acciones editar/eliminar, botón "Nueva/Nuevo"
- **Páginas de formulario**: React Hook Form con `register()` + `Controller` para campos complejos, `helperText` para errores, submit deshabilitado mientras `isSubmitting`
- **Crear vs Editar**: Determinado por presencia del param URL `:id`; pre-poblar formulario con hook `useGet*`

### UI y Estilos
- Usar prop `sx` de MUI para estilos inline. No usar CSS modules ni styled-components
- Layout responsive vía breakpoints MUI (`xs`/`md`/`lg` en `sx`)
- Modo oscuro vía `useThemeStore().toggleDarkMode()` — persiste en localStorage

### Entorno y Seguridad
- **Nunca** hardcodear URLs o keys de Supabase — siempre usar `import.meta.env.VITE_*`
- Validar tipo MIME + tamaño de archivo antes de subir (PDFs max 5MB, imágenes comprimidas vía `browser-image-compression`)
- Todas las tablas usan Row Level Security; `usuarios` restringido al propio perfil, las demás requieren rol autenticado

## Agregar una Nueva Entidad

1. Agregar tabla + índices + políticas RLS en `database-schema.sql`
2. Agregar queries `useGet*` en `src/hooks/queries.js`
3. Agregar mutations `useCreate*`, `useUpdate*`, `useDelete*` en `src/hooks/mutations.js` (con `buildPayload()`)
4. Crear página de listado (`*Page.jsx`) con DataGrid + búsqueda/filtros
5. Crear página de formulario (`*FormPage.jsx`) con React Hook Form
6. Registrar rutas en `src/router.jsx` bajo el layout protegido
7. Agregar ítem de navegación en `src/components/DashboardLayout.jsx`
