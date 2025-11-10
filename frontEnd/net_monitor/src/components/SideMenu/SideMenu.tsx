import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SelectContent from '../SelectContent';
import MenuContent from './MenuContent';
import Button from '@mui/material/Button';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function SideMenu() {
  const auth = useAuth();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userData') || '{}');

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: '#0a0f1a',
          borderRight: '1px solid rgba(139, 92, 246, 0.1)',
          backgroundImage: 'linear-gradient(180deg, rgba(139, 92, 246, 0.03) 0%, rgba(139, 92, 246, 0) 100%)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 1.5,
        }}
      >
        <SelectContent />
      </Box>
      
      <Divider sx={{ 
        borderColor: 'rgba(139, 92, 246, 0.15)',
        my: 1
      }} />
      
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(139, 92, 246, 0.3)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(139, 92, 246, 0.5)',
          },
        }}
      >
        <MenuContent />
      </Box>
      
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid rgba(139, 92, 246, 0.15)',
          backgroundColor: 'rgba(139, 92, 246, 0.03)',
        }}
      >
        <Avatar
          sizes="small"
          alt={user.username}
          src="/static/images/avatar/7.jpg"
          sx={{ 
            width: 36, 
            height: 36,
            border: '2px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 0 10px rgba(139, 92, 246, 0.2)'
          }}
        />
        <Box sx={{ mr: 'auto' }}>
          <Typography 
            variant="body2" 
            sx={{
              fontWeight: 600,
              lineHeight: '16px',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
              maxWidth: '100px',
              color: '#e2e8f0'
            }}
          >
            {user.username}
          </Typography>
          <Typography 
            variant="caption"
            sx={{
              color: 'rgba(226, 232, 240, 0.6)',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
              maxWidth: '100px'
            }}
          >
            {user.email}
          </Typography>
        </Box>
        <Button 
          onClick={() => {
            auth.logout();
            navigate('/login');
          }}
          sx={{
            minWidth: 'auto',
            p: 1,
            borderRadius: '8px',
            color: 'rgba(226, 232, 240, 0.8)',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              color: '#a78bfa',
              transform: 'scale(1.05)'
            }
          }}
        >
          <LogoutRoundedIcon fontSize="small" />
        </Button>
      </Stack>
    </Drawer>
  );
}