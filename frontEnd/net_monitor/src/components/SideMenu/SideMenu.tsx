import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SelectContent from "../SelectContent";
import MenuContent from "./MenuContent";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const drawerWidth = 280;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function SideMenu() {
  const auth = useAuth();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userData") || "{}");

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "#0f172a",
          backgroundImage: `
            linear-gradient(180deg, rgba(0, 212, 255, 0.05) 0%, transparent 100%),
            radial-gradient(ellipse at top left, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(0, 212, 255, 0.05) 0%, transparent 50%)
          `,
          borderRight: "1px solid rgba(0, 212, 255, 0.1)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 40px rgba(0, 212, 255, 0.1)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 2,
          pb: 1,
        }}
      >
        <SelectContent />
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(0, 212, 255, 0.15)",
          mx: 2,
          my: 1,
        }}
      />

      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0, 212, 255, 0.3)",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(0, 212, 255, 0.5)",
          },
        }}
      >
        <MenuContent />
      </Box>

      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1.5,
          alignItems: "center",
          borderTop: "1px solid rgba(0, 212, 255, 0.15)",
          backgroundColor: "rgba(0, 212, 255, 0.03)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Avatar
          sizes="small"
          alt={user.username}
          src="/static/images/avatar/7.jpg"
          sx={{
            width: 40,
            height: 40,
            border: "2px solid rgba(0, 212, 255, 0.3)",
            background:
              "linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 212, 255, 0.4) 100%)",
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.2)",
            fontWeight: "bold",
            color: "#00d4ff",
          }}
        >
          {user.username?.charAt(0)?.toUpperCase()}
        </Avatar>
        <Box sx={{ mr: "auto", minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              lineHeight: "18px",
              color: "#f8fafc",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.username}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(248, 250, 252, 0.6)",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.email}
          </Typography>
        </Box>
        <Button
          onClick={() => {
            auth.logout();
            navigate("/login");
          }}
          sx={{
            minWidth: "auto",
            p: 1,
            borderRadius: "10px",
            color: "rgba(248, 250, 252, 0.7)",
            backgroundColor: "rgba(0, 212, 255, 0.1)",
            border: "1px solid rgba(0, 212, 255, 0.2)",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "rgba(0, 212, 255, 0.2)",
              color: "#00d4ff",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 15px rgba(0, 212, 255, 0.3)",
              border: "1px solid rgba(0, 212, 255, 0.4)",
            },
          }}
        >
          <LogoutRoundedIcon fontSize="small" />
        </Button>
      </Stack>
    </Drawer>
  );
}
