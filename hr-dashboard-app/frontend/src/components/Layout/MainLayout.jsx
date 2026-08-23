import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  School,
  Receipt,
  BarChart,
  Settings,
  Logout,
  AccountCircle,
  Notifications,
  ChevronRight,
} from '@mui/icons-material';
import { theme } from '../../themes/theme';

const drawerWidth = 280;

const menuItems = [
  { text: 'Tableau de Bord', icon: <Dashboard />, path: '/' },
  { text: 'Employés', icon: <People />, path: '/employees' },
  { text: 'Formations', icon: <School />, path: '/formations' },
  { text: 'Dépenses', icon: <Receipt />, path: '/depenses' },
  { text: 'Rapports', icon: <BarChart />, path: '/reports' },
  { text: 'Paramètres', icon: <Settings />, path: '/settings' },
];

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNotifOpen = (event) => setNotifAnchorEl(event.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        }}
      >
        <Typography variant="h5" fontWeight="700" color="white" sx={{ letterSpacing: '-0.5px' }}>
          🏢 HR Dashboard
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ mt: 0.5 }}>
          Gestion des Ressources Humaines
        </Typography>
        <Chip
          label="v2.0"
          size="small"
          sx={{
            mt: 1,
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        />
      </Box>

      <List sx={{ flex: 1, pt: 2, px: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={item.text}
              button
              selected={isActive}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  bgcolor: 'primary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? 'white' : 'text.secondary', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.95rem',
                }}
              />
              {isActive && <ChevronRight fontSize="small" />}
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid #E4E7ED' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <AccountCircle />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="600">
              Administrateur
            </Typography>
            <Typography variant="caption" color="text.secondary">
              admin@example.com
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F6F8' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={handleNotifOpen} color="inherit">
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <Menu
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={handleNotifClose}
              PaperProps={{
                sx: {
                  width: 320,
                  maxHeight: 400,
                  borderRadius: 3,
                  mt: 1,
                },
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="600">
                  Notifications
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleNotifClose}>
                <Box>
                  <Typography variant="body2" fontWeight="500">
                    Nouvel employé ajouté
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Il y a 2 minutes
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={handleNotifClose}>
                <Box>
                  <Typography variant="body2" fontWeight="500">
                    Formation planifiée
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Il y a 1 heure
                  </Typography>
                </Box>
              </MenuItem>
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>
                  Voir toutes les notifications
                </Typography>
              </Box>
            </Menu>

            <IconButton onClick={handleMenuOpen} color="inherit">
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                A
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  mt: 1,
                  minWidth: 200,
                },
              }}
            >
              <MenuItem onClick={handleMenuClose}>
                <AccountCircle sx={{ mr: 1 }} />
                Profil
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Settings sx={{ mr: 1 }} />
                Paramètres
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <Logout sx={{ mr: 1 }} />
                Déconnexion
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              bgcolor: 'white',
              boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#F5F6F8',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
