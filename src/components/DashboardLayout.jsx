import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Divider,
  Typography,
  Button,
  Collapse,
  ButtonBase,
  Tooltip,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Checkroom as CheckroomIcon,
  Insights as InsightsIcon,
  Inventory2 as Inventory2Icon,
  SdStorage as SdStorageIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  VpnKey as VpnKeyIcon,
  Cable as CableIcon,
  LocalShipping as LocalShippingIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Home as HomeIcon,
  Widgets as WidgetsIcon,
  Settings as SettingsIcon,
  ViewSidebar as ViewSidebarIcon,
} from '@mui/icons-material'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { useGetUserPermissions } from '../hooks/queries'
import { HeaderActionsProvider, useHeaderActions } from './HeaderActionsContext'

const DRAWER_WIDTH = 210
const RAIL_WIDTH = 72

const RAIL_ITEMS = [
  { key: 'inicio', label: 'Inicio', icon: <HomeIcon /> },
  { key: 'programa', label: 'Programa', icon: <WidgetsIcon /> },
  { key: 'ajustes', label: 'Ajustes', icon: <SettingsIcon /> },
]

const ICON_MAP = {
  Dashboard: <DashboardIcon />,
  PrecisionManufacturing: <PrecisionManufacturingIcon />,
  Checkroom: <CheckroomIcon />,
  Insights: <InsightsIcon />,
  Inventory2: <Inventory2Icon />,
  SdStorage: <SdStorageIcon />,
  Cable: <CableIcon />,
  LocalShipping: <LocalShippingIcon />,
  People: <PeopleIcon />,
  AdminPanelSettings: <AdminPanelSettingsIcon />,
}

// Routes that go into the "Configuraciones" collapsible group
const SETTINGS_ROUTES = ['/hilos', '/proveedores']
// Routes that go into the "Administración" collapsible group
const ADMIN_ROUTES = ['/admin/usuarios', '/admin/roles']

export const DashboardLayout = () => {
  return (
    <HeaderActionsProvider>
      <DashboardLayoutInner />
    </HeaderActionsProvider>
  )
}

const DashboardLayoutInner = () => {
  const { headerActions } = useHeaderActions()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(
    location.pathname.startsWith('/hilos') || location.pathname.startsWith('/proveedores')
  )
  const [adminMenuOpen, setAdminMenuOpen] = useState(
    location.pathname.startsWith('/admin')
  )
  const [drawerCollapsed, setDrawerCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState(() => {
    if (
      SETTINGS_ROUTES.some((r) => location.pathname.startsWith(r)) ||
      ADMIN_ROUTES.some((r) => location.pathname.startsWith(r))
    ) {
      return 'ajustes'
    }
    return 'programa'
  })
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const darkMode = useThemeStore((state) => state.darkMode)
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode)
  const { data: permissionsData } = useGetUserPermissions(user?.id)

  useEffect(() => {
    if (
      SETTINGS_ROUTES.some((r) => location.pathname.startsWith(r)) ||
      ADMIN_ROUTES.some((r) => location.pathname.startsWith(r))
    ) {
      setActiveSection('ajustes')
    } else if (location.pathname !== '/') {
      setActiveSection('programa')
    }
  }, [location.pathname])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
    handleMenuClose()
  }

  const handleRailClick = (key) => {
    setActiveSection(key)
    if (key === 'inicio') {
      navigate('/')
    }
  }

  const showDrawer = activeSection !== 'inicio' && !drawerCollapsed

  const navigationItems = (permissionsData?.permissions || [])
    .filter((p) => p.puede_ver && !SETTINGS_ROUTES.includes(p.ruta) && !ADMIN_ROUTES.includes(p.ruta))
    .map((p) => ({
      label: p.nombre,
      icon: ICON_MAP[p.icono] || <DashboardIcon />,
      path: p.ruta,
    }))

  const settingsSubItems = (permissionsData?.permissions || [])
    .filter((p) => p.puede_ver && SETTINGS_ROUTES.includes(p.ruta))
    .map((p) => ({
      label: p.nombre,
      icon: ICON_MAP[p.icono] ? <p.icono /> : <CableIcon fontSize="small" />,
      path: p.ruta,
    }))
    // Use proper icons for settings sub-items
    .map((item) => ({
      ...item,
      icon: ICON_MAP[(permissionsData?.permissions || []).find((p) => p.ruta === item.path)?.icono] || <CableIcon fontSize="small" />,
    }))

  const adminSubItems = (permissionsData?.permissions || [])
    .filter((p) => p.puede_ver && ADMIN_ROUTES.includes(p.ruta))
    .map((p) => ({
      label: p.nombre,
      icon: ICON_MAP[p.icono] || <AdminPanelSettingsIcon fontSize="small" />,
      path: p.ruta,
    }))

  const currentPageLabel = (() => {
    if (location.pathname.startsWith('/configuraciones')) return 'Programa Hqpds'
    if (location.pathname.startsWith('/materiales')) return 'Materiales'
    if (location.pathname.startsWith('/hilos')) return 'Hilos'
    if (location.pathname.startsWith('/proveedores')) return 'Proveedores'
    if (location.pathname.startsWith('/admin/usuarios')) return 'Gestión de Usuarios'
    if (location.pathname.startsWith('/admin/roles')) return 'Gestión de Roles'
    return navigationItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'
  })()

  const renderNavItem = (item, onNavigate) => {
    const isActive = location.pathname === item.path

    return (
      <ListItem key={item.path} disablePadding>
        <ListItemButton
          onClick={() => {
            onNavigate(item.path)
          }}
          sx={{
            minHeight: 52,
            px: 1.5,
            borderRadius: 2.5,
            bgcolor: isActive ? '#d9d4cf' : 'transparent',
            color: isActive ? 'text.primary' : 'text.primary',
            '&:hover': {
              bgcolor: isActive ? '#cec9c4' : 'action.hover',
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: 'inherit',
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: isActive ? 'rgba(0,0,0,0.08)' : 'action.hover',
              }}
            >
              {item.icon}
            </Box>
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 700 : 500 }}
          />
        </ListItemButton>
      </ListItem>
    )
  }

  const desktopDrawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: darkMode ? 'background.paper' : '#f3f2eb',
      }}
    >
      <Box sx={{ px: 1.5, pt: 3, pb: 2 }}>
        {activeSection === 'programa' && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ px: 2, pb: 1, display: 'block' }}>
              PROGRAMA
            </Typography>
            <List sx={{ display: 'grid', gap: 0.5 }}>
              {navigationItems.map((item) => renderNavItem(item, (path) => navigate(path)))}
            </List>
          </>
        )}

        {activeSection === 'ajustes' && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ px: 2, pb: 1, display: 'block' }}>
              AJUSTES
            </Typography>

            {settingsSubItems.length > 0 && (
              <>
                <Typography
                  variant="overline"
                  sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', color: 'text.disabled', fontSize: 10 }}
                >
                  CONFIGURACIONES
                </Typography>
                <List sx={{ display: 'grid', gap: 0.5 }}>
                  {settingsSubItems.map((item) => renderNavItem(item, (path) => navigate(path)))}
                </List>
              </>
            )}

            {adminSubItems.length > 0 && (
              <>
                <Typography
                  variant="overline"
                  sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', color: 'text.disabled', fontSize: 10 }}
                >
                  ADMINISTRACIÓN
                </Typography>
                <List sx={{ display: 'grid', gap: 0.5 }}>
                  {adminSubItems.map((item) => renderNavItem(item, (path) => navigate(path)))}
                </List>
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  )

  const mobileDrawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ px: 1.5, pt: 3, pb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, pb: 1, display: 'block' }}>
          NAVEGACIÓN
        </Typography>
        <List sx={{ display: 'grid', gap: 0.5 }}>
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path

            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path)
                    setMobileOpen(false)
                  }}
                  sx={{
                    minHeight: 52,
                    px: 1.5,
                    borderRadius: 2.5,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: 'inherit',
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: isActive ? 'rgba(255,255,255,0.18)' : 'action.hover',
                      }}
                    >
                      {item.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 700 : 500 }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}

          {settingsSubItems.length > 0 && (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                  sx={{
                    minHeight: 52,
                    px: 1.5,
                    borderRadius: 2.5,
                    bgcolor:
                      location.pathname.startsWith('/hilos') || location.pathname.startsWith('/proveedores')
                        ? 'action.hover'
                        : 'transparent',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'action.hover',
                      }}
                    >
                      <Inventory2Icon />
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary="Configuraciones" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
                  {settingsMenuOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </ListItemButton>
              </ListItem>

              <Collapse in={settingsMenuOpen} timeout="auto" unmountOnExit>
                <List sx={{ py: 0, pl: 2 }}>
                  {settingsSubItems.map((subItem) => {
                    const isSubActive = location.pathname === subItem.path

                    return (
                      <ListItem key={subItem.path} disablePadding>
                        <ListItemButton
                          onClick={() => {
                            navigate(subItem.path)
                            setMobileOpen(false)
                          }}
                          sx={{
                            minHeight: 42,
                            px: 1.5,
                            borderRadius: 2,
                            bgcolor: isSubActive ? 'primary.main' : 'transparent',
                            color: isSubActive ? 'primary.contrastText' : 'text.secondary',
                            '&:hover': {
                              bgcolor: isSubActive ? 'primary.dark' : 'action.hover',
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={subItem.label}
                            primaryTypographyProps={{ fontSize: 13, fontWeight: isSubActive ? 700 : 500 }}
                          />
                        </ListItemButton>
                      </ListItem>
                    )
                  })}
                </List>
              </Collapse>
            </>
          )}

          {adminSubItems.length > 0 && (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                  sx={{
                    minHeight: 52,
                    px: 1.5,
                    borderRadius: 2.5,
                    bgcolor: location.pathname.startsWith('/admin') ? 'action.hover' : 'transparent',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'action.hover',
                      }}
                    >
                      <AdminPanelSettingsIcon />
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary="Administración" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
                  {adminMenuOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </ListItemButton>
              </ListItem>

              <Collapse in={adminMenuOpen} timeout="auto" unmountOnExit>
                <List sx={{ py: 0, pl: 2 }}>
                  {adminSubItems.map((subItem) => {
                    const isSubActive = location.pathname === subItem.path

                    return (
                      <ListItem key={subItem.path} disablePadding>
                        <ListItemButton
                          onClick={() => {
                            navigate(subItem.path)
                            setMobileOpen(false)
                          }}
                          sx={{
                            minHeight: 42,
                            px: 1.5,
                            borderRadius: 2,
                            bgcolor: isSubActive ? 'primary.main' : 'transparent',
                            color: isSubActive ? 'primary.contrastText' : 'text.secondary',
                            '&:hover': {
                              bgcolor: isSubActive ? 'primary.dark' : 'action.hover',
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={subItem.label}
                            primaryTypographyProps={{ fontSize: 13, fontWeight: isSubActive ? 700 : 500 }}
                          />
                        </ListItemButton>
                      </ListItem>
                    )
                  })}
                </List>
              </Collapse>
            </>
          )}
        </List>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', ml: { xs: 0, md: `${RAIL_WIDTH}px` } }}>
      {/* Rail Sidebar — desktop only */}
      {!isMobile && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: RAIL_WIDTH,
            bgcolor: darkMode ? '#111118' : '#f3f2eb',
            zIndex: (theme) => theme.zIndex.drawer + 2,
            borderRight: '1px solid',
            borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              height: 72,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: darkMode ? '#fff' : '#1e1e2d' }}>
              K
            </Typography>
          </Box>

          {RAIL_ITEMS.map((item) => {
            const isActive = activeSection === item.key
            return (
              <ButtonBase
                key={item.key}
                onClick={() => handleRailClick(item.key)}
                sx={{
                  flexDirection: 'column',
                  width: 56,
                  py: 1.5,
                  px: 1,
                  borderRadius: 2,
                  bgcolor: isActive
                    ? (darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)')
                    : 'transparent',
                  color: isActive
                    ? (darkMode ? '#fff' : '#1e1e2d')
                    : (darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'),
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  },
                  mb: 0.5,
                }}
              >
                {item.icon}
                <Typography sx={{ fontSize: 10, fontWeight: 'inherit', color: 'inherit', mt: 0.5 }}>
                  {item.label}
                </Typography>
              </ButtonBase>
            )
          })}

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={drawerCollapsed ? 'Mostrar barra lateral' : 'Ocultar barra lateral'} placement="right">
            <IconButton
              onClick={() => setDrawerCollapsed((prev) => !prev)}
              sx={{
                mb: 2,
                color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              }}
            >
              <ViewSidebarIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          left: { xs: 0, md: showDrawer ? RAIL_WIDTH + DRAWER_WIDTH : RAIL_WIDTH },
          width: { xs: '100%', md: showDrawer ? `calc(100% - ${RAIL_WIDTH + DRAWER_WIDTH}px)` : `calc(100% - ${RAIL_WIDTH}px)` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: 0,
          bgcolor: 'background.paper',
          backdropFilter: 'blur(12px)',
          transition: 'left 0.2s ease-in-out, width 0.2s ease-in-out',
        }}
      >
        <Toolbar sx={{ minHeight: 72 }}>
          {isMobile && (
            <IconButton
              color="default"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            {headerActions}
          </Box>

          <IconButton
            onClick={handleMenuOpen}
            sx={{ ml: 2 }}
          >
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
              src={user?.user_metadata?.avatar_url}
            >
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { minWidth: 220, borderRadius: 2, mt: 1 },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user?.user_metadata?.full_name || 'Usuario'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || 'Sin correo'}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { navigate('/perfil'); handleMenuClose(); }} sx={{ py: 1.2 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Mi perfil
            </MenuItem>
            <MenuItem onClick={() => { navigate('/cambiar-contraseña'); handleMenuClose(); }} sx={{ py: 1.2 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <VpnKeyIcon fontSize="small" />
              </ListItemIcon>
              Cambiar contraseña
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: 'error.main' }}>
              <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {!isMobile && showDrawer && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              left: RAIL_WIDTH,
            },
          }}
        >
          {desktopDrawerContent}
        </Drawer>
      )}

      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {mobileDrawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3.5 },
          mt: 8,
          width: { xs: '100%', md: showDrawer ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          bgcolor: darkMode ? 'background.default' : '#fff',
          transition: 'width 0.2s ease-in-out',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
