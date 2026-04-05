import { useState } from 'react'
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
} from '@mui/icons-material'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { useGetUserPermissions } from '../hooks/queries'

const DRAWER_WIDTH = 280

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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(
    location.pathname.startsWith('/hilos') || location.pathname.startsWith('/proveedores')
  )
  const [adminMenuOpen, setAdminMenuOpen] = useState(
    location.pathname.startsWith('/admin')
  )
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const darkMode = useThemeStore((state) => state.darkMode)
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode)
  const { data: permissionsData } = useGetUserPermissions(user?.id)

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

  const drawerContent = (
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

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

      <Box sx={{ px: 1.5, py: 1 }}>
        <ListItemButton
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          sx={{
            borderRadius: 2.5,
            px: 1.5,
            mb: 1,
            bgcolor: 'action.hover',
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
              src={user?.user_metadata?.avatar_url}
            >
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={user?.user_metadata?.full_name || 'Usuario'}
            secondary={user?.email || 'Sin correo'}
            primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
            secondaryTypographyProps={{ fontSize: 11 }}
          />
          <ListItemIcon sx={{ minWidth: 0 }}>
            {userMenuOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </ListItemIcon>
        </ListItemButton>

        <Collapse in={userMenuOpen} timeout="auto">
          <List sx={{ py: 0, pl: 1 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate('/perfil')
                  setMobileOpen(false)
                }}
                sx={{
                  minHeight: 44,
                  px: 1.5,
                  borderRadius: 2,
                  fontSize: 13,
                }}
              >
                <ListItemIcon sx={{ minWidth: 35 }}>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Mi perfil" primaryTypographyProps={{ fontSize: 13 }} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate('/cambiar-contraseña')
                  setMobileOpen(false)
                }}
                sx={{
                  minHeight: 44,
                  px: 1.5,
                  borderRadius: 2,
                  fontSize: 13,
                }}
              >
                <ListItemIcon sx={{ minWidth: 35 }}>
                  <VpnKeyIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Cambiar contraseña" primaryTypographyProps={{ fontSize: 13 }} />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 0.5 }} />
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  minHeight: 44,
                  px: 1.5,
                  borderRadius: 2,
                  fontSize: 13,
                  color: 'error.main',
                }}
              >
                <ListItemIcon sx={{ minWidth: 35, color: 'inherit' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Cerrar sesión" primaryTypographyProps={{ fontSize: 13 }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Collapse>

        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          onClick={toggleDarkMode}
          sx={{ mt: 1 }}
        >
          Tema
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          backdropFilter: 'blur(12px)',
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
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: 1.4, textAlign: 'left', textTransform: 'uppercase' }}
            >
              PANEL PRINCIPAL
            </Typography>
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: 700, textAlign: 'left', textTransform: 'uppercase' }}
            >
              {currentPageLabel.toUpperCase()}
            </Typography>
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
          >
            <MenuItem onClick={() => { navigate('/perfil'); handleMenuClose(); }}>
              Mi perfil
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {!isMobile && (
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
            },
          }}
        >
          {drawerContent}
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
          {drawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3.5 },
          mt: 9,
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          bgcolor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
