import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import RouterIcon from "@mui/icons-material/Router";
import PodcastsIcon from "@mui/icons-material/Podcasts";
import StorageIcon from "@mui/icons-material/Storage";
import { useI18n } from "../../hooks/usei18n";
import { useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { Divider } from "@mui/material";

const StyledListItemButton = styled(ListItemButton)(({ selected }) => ({
  borderRadius: "12px",
  margin: "4px 8px",
  padding: "12px 16px",
  border: selected
    ? "1px solid rgba(0, 212, 255, 0.4)"
    : "1px solid transparent",
  background: selected
    ? "linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.05) 100%)"
    : "transparent",
  backdropFilter: selected ? "blur(10px)" : "none",
  transition: "all 0.3s ease",
  "&:hover": {
    background:
      "linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 212, 255, 0.02) 100%)",
    border: "1px solid rgba(0, 212, 255, 0.2)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 15px rgba(0, 212, 255, 0.1)",
  },
  "& .MuiListItemIcon-root": {
    color: selected ? "#00d4ff" : "rgba(248, 250, 252, 0.7)",
    transition: "color 0.3s ease",
    minWidth: "40px",
  },
  "& .MuiListItemText-primary": {
    color: selected ? "#00d4ff" : "#f8fafc",
    fontWeight: selected ? 600 : 500,
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
  },
}));

export default function MenuContent() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const mainListItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    {
      text: t("sideMenu.mainItemsList.routers"),
      icon: <RouterIcon />,
      path: "/routers",
    },
    {
      text: t("sideMenu.mainItemsList.transmitters"),
      icon: <PodcastsIcon />,
      path: "/transmitters",
    },
    {
      text: t("sideMenu.mainItemsList.switches"),
      icon: <StorageIcon />,
      path: "/switches",
    },
  ];

  const secondaryListItems = [
    { text: "Settings", icon: <SettingsRoundedIcon />, path: "/settings" },
    { text: "About", icon: <InfoRoundedIcon />, path: "/about" },
    { text: "Feedback", icon: <HelpRoundedIcon />, path: "/feedback" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isSelected = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Stack
      sx={{
        flexGrow: 1,
        p: 1,
        justifyContent: "space-between",
        background: "transparent",
      }}
    >
      <List dense sx={{ py: 1 }}>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <StyledListItemButton
              selected={isSelected(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: "0.9rem",
                  },
                }}
              />
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider
        sx={{
          borderColor: "rgba(0, 212, 255, 0.1)",
          mx: 2,
          my: 1,
        }}
      />

      <List dense sx={{ py: 1 }}>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <StyledListItemButton
              selected={isSelected(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: "0.9rem",
                  },
                }}
              />
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
