import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import RouterIcon from '@mui/icons-material/Router';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import StorageIcon from '@mui/icons-material/Storage';
import { useI18n } from '../../hooks/usei18n';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MenuContent() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  
  const mainListItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: t('sideMenu.mainItemsList.routers'), icon: <RouterIcon />, path: '/routers' },
    { text: t('sideMenu.mainItemsList.transmitters'), icon: <PodcastsIcon />, path: '/transmitters' },
    { text: t('sideMenu.mainItemsList.switches'), icon: <StorageIcon />, path: '/switches' },
  ];
  
  const secondaryListItems = [
    { text: 'Settings', icon: <SettingsRoundedIcon />, path: '/settings' },
    { text: 'About', icon: <InfoRoundedIcon />, path: '/about' },
    { text: 'Feedback', icon: <HelpRoundedIcon />, path: '/feedback' },
  ];
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  const isSelected = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={isSelected(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton 
              selected={isSelected(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}