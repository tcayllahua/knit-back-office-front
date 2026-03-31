# Setup Instructions - Knit Back Office

Esta guía te ayudará a completar la configuración inicial del proyecto.

## 1. Configurar Variables de Entorno

El archivo `.env.local` ya existe con placeholders. Necesitas:

1. Obtener las credenciales de tu proyecto Supabase
2. Reemplazar los valores en `.env.local`:
   - `VITE_SUPABASE_URL`: URL de tu proyecto Supabase (ej: https://xxxxx.supabase.co)
   - `VITE_SUPABASE_ANON_KEY`: Tu anonymous key de Supabase

### Dónde encontrar las credenciales:
- Ve a https://supabase.com y entra a tu proyecto
- En Settings → API, encontrarás tu Project URL y Anon Key
- Copia estos valores al archivo `.env.local`

## 2. Crear Estructura de Base de Datos

1. En Supabase Console, ve a SQL Editor
2. Haz clic en "New Query"
3. Copia el contenido completo de `database-schema.sql`
4. Pégalo en el editor de SQL
5. Ejecuta la query
6. Verifica que se crearon las tablas `usuarios` y `maquinas`

### Verificar que se creó correctamente:
- Ve a Table Editor
- Deberías ver las tablas `usuarios` y `maquinas`
- Las políticas RLS deberían estar activas

## 3. Crear Storage Buckets

En Supabase Console, ve a Storage y crea dos buckets:

### Bucket 1: fichas-tecnicas
- Nombre: `fichas-tecnicas`
- Público: Sí (para que los usuarios puedan ver/descargar PDFs)
- Políticas: Usa las creadas automáticamente por el SQL

### Bucket 2: usuarios
- Nombre: `usuarios`
- Público: Sí (para que las fotos de perfil se vean)
- Políticas: Usa las creadas automáticamente por el SQL

## 4. Configurar Autenticación en Supabase

1. Ve a Settings → Auth → Providers
2. Email debe estar habilitado (por defecto lo está)
3. Opcionalmente habilita otros proveedores (Google, GitHub, etc.)

## 5. Iniciar la Aplicación

```bash
# Instalar dependencias (si no lo hiciste)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en: http://localhost:5173

## 6. Probar la Aplicación

1. **Registrarse**: Ve a /register y crea una cuenta
2. **Iniciar sesión**: Con el email/contraseña creado
3. **Dashboard**: Deberías ver el dashboard vacío
4. **Crear máquina**: El botón "Nueva Máquina" en la sección de máquinas
5. **Editar perfil**: Avatar en la esquina superior derecha

## Troubleshooting

### Error: "Missing Supabase credentials"
- Verifica que `.env.local` tiene valores válidos
- Reinicia el servidor de desarrollo (Ctrl+C y npm run dev)

### Error: Database connection failed
- Verifica la URL de Supabase
- Asegúrate de que ejecutaste el SQL de `database-schema.sql`
- Verifica que las RLS policies estén habilitadas

### Error: Upload fails
- Verifica que los buckets se crearon correctamente
- Comprueba que los buckets son públicos
- Revisa la consola del navegador para más detalles

### Storage bucket not found
- Asegúrate de que creaste los buckets con exactamente estos nombres:
  - `fichas-tecnicas`
  - `usuarios`

## Estructura del Proyecto

```
knit-back-office-front/
├── src/
│   ├── config/          # Configuración de Supabase
│   ├── store/           # Zustand (auth, theme, machines)
│   ├── hooks/           # React Query (queries, mutations)
│   ├── components/      # DashboardLayout, ProtectedRoute
│   ├── pages/           # Login, Register, Dashboard, Machines, Profile
│   ├── App.jsx          # Componente raíz
│   ├── router.jsx       # Definición de rutas
│   ├── theme.js         # Configuración de MUI
│   └── main.jsx         # Entrada
├── .env.local           # Variables de entorno (COMPLETA ESTO)
├── database-schema.sql  # Schema de BD (ejecuta esto en Supabase)
├── README.md            # Documentación
├── package.json
└── vite.config.js
```

## Scripts Disponibles

```bash
npm run dev           # Desarrollar localmente
npm run build         # Build para producción
npm run preview       # Preview del build
npm run lint          # Linter
npm run type-check    # Type checking
```

## Próximos Pasos

1. ✅ Completar `.env.local` con credenciales
2. ✅ Ejecutar `database-schema.sql` en Supabase
3. ✅ Crear buckets de Storage
4. ✅ Ejecutar `npm run dev` y testear

¡Listo! Ahora tienes una aplicación de back office completamente funcional.

## Necesitas Ayuda?

- Documentación de Supabase: https://supabase.com/docs
- Documentación de React: https://react.dev
- Documentación de Material-UI: https://mui.com
- Documentación de React Hook Form: https://react-hook-form.com
