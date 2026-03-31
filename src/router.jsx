import { Navigate, createBrowserRouter } from 'react-router-dom'
import { DashboardLayout } from './components/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { MaquinasPage } from './pages/MaquinasPage'
import { MaquinaFormPage } from './pages/MaquinaFormPage'
import { MiPerfilPage } from './pages/MiPerfilPage'
import { GarmentParametersPage } from './pages/GarmentParametersPage'
import { GarmentParameterFormPage } from './pages/GarmentParameterFormPage'
import { KnittingParametersPage } from './pages/KnittingParametersPage'
import { KnittingParameterFormPage } from './pages/KnittingParameterFormPage'
import { MaterialParametersPage } from './pages/MaterialParametersPage'
import { MaterialParameterFormPage } from './pages/MaterialParameterFormPage'
import { HilosPage } from './pages/HilosPage'
import { HiloFormPage } from './pages/HiloFormPage'
import { ProveedoresPage } from './pages/ProveedoresPage'
import { ProveedorFormPage } from './pages/ProveedorFormPage'
import { HqpdsConfigurationsPage } from './pages/HqpdsConfigurationsPage'
import { HqpdsConfigurationFormPage } from './pages/HqpdsConfigurationFormPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { ChangePasswordPage } from './pages/ChangePasswordPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'maquinas',
        element: <MaquinasPage />,
      },
      {
        path: 'maquinas/nueva',
        element: <MaquinaFormPage />,
      },
      {
        path: 'maquinas/editar/:id',
        element: <MaquinaFormPage />,
      },
      {
        path: 'perfil',
        element: <MiPerfilPage />,
      },
      {
        path: 'cambiar-contraseña',
        element: <ChangePasswordPage />,
      },
      {
        path: 'prendas',
        element: <GarmentParametersPage />,
      },
      {
        path: 'prendas/nueva',
        element: <GarmentParameterFormPage />,
      },
      {
        path: 'prendas/editar/:id',
        element: <GarmentParameterFormPage />,
      },
      {
        path: 'tejido',
        element: <KnittingParametersPage />,
      },
      {
        path: 'tejido/nueva',
        element: <KnittingParameterFormPage />,
      },
      {
        path: 'tejido/editar/:id',
        element: <KnittingParameterFormPage />,
      },
      {
        path: 'materiales',
        element: <MaterialParametersPage />,
      },
      {
        path: 'materiales/nueva',
        element: <MaterialParameterFormPage />,
      },
      {
        path: 'materiales/editar/:id',
        element: <MaterialParameterFormPage />,
      },
      {
        path: 'hilos',
        element: <HilosPage />,
      },
      {
        path: 'hilos/nuevo',
        element: <HiloFormPage />,
      },
      {
        path: 'hilos/editar/:id',
        element: <HiloFormPage />,
      },
      {
        path: 'proveedores',
        element: <ProveedoresPage />,
      },
      {
        path: 'proveedores/nuevo',
        element: <ProveedorFormPage />,
      },
      {
        path: 'proveedores/editar/:id',
        element: <ProveedorFormPage />,
      },
      {
        path: 'configuraciones',
        element: <HqpdsConfigurationsPage />,
      },
      {
        path: 'configuraciones/nueva',
        element: <HqpdsConfigurationFormPage />,
      },
      {
        path: 'configuraciones/editar/:id',
        element: <HqpdsConfigurationFormPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
