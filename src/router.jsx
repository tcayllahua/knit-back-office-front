import { Navigate, createBrowserRouter } from 'react-router-dom'
import { DashboardLayout } from './components/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoutePermissionGuard } from './components/RoutePermissionGuard'
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
import { UsersManagementPage } from './pages/UsersManagementPage'
import { RolesManagementPage } from './pages/RolesManagementPage'

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
        element: <RoutePermissionGuard route="/"><DashboardPage /></RoutePermissionGuard>,
      },
      {
        path: 'maquinas',
        element: <RoutePermissionGuard route="/maquinas"><MaquinasPage /></RoutePermissionGuard>,
      },
      {
        path: 'maquinas/nueva',
        element: <RoutePermissionGuard route="/maquinas"><MaquinaFormPage /></RoutePermissionGuard>,
      },
      {
        path: 'maquinas/editar/:id',
        element: <RoutePermissionGuard route="/maquinas"><MaquinaFormPage /></RoutePermissionGuard>,
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
        element: <RoutePermissionGuard route="/prendas"><GarmentParametersPage /></RoutePermissionGuard>,
      },
      {
        path: 'prendas/nueva',
        element: <RoutePermissionGuard route="/prendas"><GarmentParameterFormPage /></RoutePermissionGuard>,
      },
      {
        path: 'prendas/editar/:id',
        element: <RoutePermissionGuard route="/prendas"><GarmentParameterFormPage /></RoutePermissionGuard>,
      },
      {
        path: 'tejido',
        element: <RoutePermissionGuard route="/tejido"><KnittingParametersPage /></RoutePermissionGuard>,
      },
      {
        path: 'tejido/nueva',
        element: <RoutePermissionGuard route="/tejido"><KnittingParameterFormPage /></RoutePermissionGuard>,
      },
      {
        path: 'tejido/editar/:id',
        element: <RoutePermissionGuard route="/tejido"><KnittingParameterFormPage /></RoutePermissionGuard>,
      },
      {
        path: 'materiales',
        element: <RoutePermissionGuard route="/materiales"><MaterialParametersPage /></RoutePermissionGuard>,
      },
      {
        path: 'materiales/nueva',
        element: <RoutePermissionGuard route="/materiales"><MaterialParameterFormPage /></RoutePermissionGuard>,
      },
      {
        path: 'materiales/editar/:id',
        element: <RoutePermissionGuard route="/materiales"><MaterialParameterFormPage /></RoutePermissionGuard>,
      },
      {
        path: 'hilos',
        element: <RoutePermissionGuard route="/hilos"><HilosPage /></RoutePermissionGuard>,
      },
      {
        path: 'hilos/nuevo',
        element: <RoutePermissionGuard route="/hilos"><HiloFormPage /></RoutePermissionGuard>,
      },
      {
        path: 'hilos/editar/:id',
        element: <RoutePermissionGuard route="/hilos"><HiloFormPage /></RoutePermissionGuard>,
      },
      {
        path: 'proveedores',
        element: <RoutePermissionGuard route="/proveedores"><ProveedoresPage /></RoutePermissionGuard>,
      },
      {
        path: 'proveedores/nuevo',
        element: <RoutePermissionGuard route="/proveedores"><ProveedorFormPage /></RoutePermissionGuard>,
      },
      {
        path: 'proveedores/editar/:id',
        element: <RoutePermissionGuard route="/proveedores"><ProveedorFormPage /></RoutePermissionGuard>,
      },
      {
        path: 'programas',
        element: <RoutePermissionGuard route="/programas"><HqpdsConfigurationsPage /></RoutePermissionGuard>,
      },
      {
        path: 'programas/nueva',
        element: <RoutePermissionGuard route="/programas"><HqpdsConfigurationFormPage /></RoutePermissionGuard>,
      },
      {
        path: 'programas/editar/:id',
        element: <RoutePermissionGuard route="/programas"><HqpdsConfigurationFormPage /></RoutePermissionGuard>,
      },
      {
        path: 'admin/usuarios',
        element: <RoutePermissionGuard route="/admin/usuarios"><UsersManagementPage /></RoutePermissionGuard>,
      },
      {
        path: 'admin/roles',
        element: <RoutePermissionGuard route="/admin/roles"><RolesManagementPage /></RoutePermissionGuard>,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])
