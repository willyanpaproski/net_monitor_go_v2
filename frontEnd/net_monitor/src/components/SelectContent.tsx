import * as React from "react";
import MuiAvatar from "@mui/material/Avatar";
import MuiListItemAvatar from "@mui/material/ListItemAvatar";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListSubheader from "@mui/material/ListSubheader";
import Select, { selectClasses } from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DevicesRoundedIcon from "@mui/icons-material/DevicesRounded";
import SmartphoneRoundedIcon from "@mui/icons-material/SmartphoneRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";

const Avatar = styled(MuiAvatar)(() => ({
  width: 32,
  height: 32,
  backgroundColor: "rgba(0, 212, 255, 0.1)",
  color: "#00d4ff",
  border: "1px solid rgba(0, 212, 255, 0.3)",
  backdropFilter: "blur(10px)",
}));

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 0,
  marginRight: 12,
});

const StyledMenuItem = styled(MenuItem)(() => ({
  borderRadius: "8px",
  margin: "4px 8px",
  padding: "12px 16px",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(0, 212, 255, 0.1)",
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(0, 212, 255, 0.15)",
    border: "1px solid rgba(0, 212, 255, 0.3)",
  },
  "&.Mui-selected:hover": {
    backgroundColor: "rgba(0, 212, 255, 0.2)",
  },
}));

const StyledListSubheader = styled(ListSubheader)(() => ({
  backgroundColor: "transparent",
  color: "rgba(248, 250, 252, 0.6)",
  fontWeight: 600,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  lineHeight: "2",
}));

const selectStyles = {
  backgroundColor: "rgba(0, 212, 255, 0.05)",
  border: "1px solid rgba(0, 212, 255, 0.2)",
  borderRadius: "12px",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(0, 212, 255, 0.08)",
    border: "1px solid rgba(0, 212, 255, 0.3)",
  },
  "&.Mui-focused": {
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    border: "1px solid rgba(0, 212, 255, 0.4)",
    boxShadow: "0 0 0 3px rgba(0, 212, 255, 0.1)",
  },
  [`& .${selectClasses.select}`]: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    color: "#f8fafc",
    fontWeight: 500,
  },
  [`& .${selectClasses.icon}`]: {
    color: "#00d4ff",
  },
};

export default function SelectContent() {
  const [company, setCompany] = React.useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setCompany(event.target.value as string);
  };

  return (
    <Select
      labelId="company-select"
      id="company-simple-select"
      value={company}
      onChange={handleChange}
      displayEmpty
      inputProps={{ "aria-label": "Select company" }}
      fullWidth
      sx={selectStyles}
      MenuProps={{
        PaperProps: {
          sx: {
            backgroundColor: "#1e293b",
            backgroundImage:
              "linear-gradient(180deg, rgba(0, 212, 255, 0.05) 0%, transparent 100%)",
            border: "1px solid rgba(0, 212, 255, 0.2)",
            borderRadius: "12px",
            backdropFilter: "blur(20px)",
            mt: 1,
            "& .MuiList-root": {
              p: "8px",
            },
          },
        },
      }}
    >
      <StyledListSubheader>Production</StyledListSubheader>
      <StyledMenuItem value="">
        <ListItemAvatar>
          <Avatar alt="Sitemark web">
            <DevicesRoundedIcon sx={{ fontSize: "1.1rem" }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary="Sitemark-web"
          secondary="Web app"
          primaryTypographyProps={{
            sx: { color: "#f8fafc", fontWeight: 500, fontSize: "0.9rem" },
          }}
          secondaryTypographyProps={{
            sx: { color: "rgba(248, 250, 252, 0.6)", fontSize: "0.8rem" },
          }}
        />
      </StyledMenuItem>
      <StyledMenuItem value={10}>
        <ListItemAvatar>
          <Avatar alt="Sitemark App">
            <SmartphoneRoundedIcon sx={{ fontSize: "1.1rem" }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary="Sitemark-app"
          secondary="Mobile application"
          primaryTypographyProps={{
            sx: { color: "#f8fafc", fontWeight: 500, fontSize: "0.9rem" },
          }}
          secondaryTypographyProps={{
            sx: { color: "rgba(248, 250, 252, 0.6)", fontSize: "0.8rem" },
          }}
        />
      </StyledMenuItem>
      <StyledMenuItem value={20}>
        <ListItemAvatar>
          <Avatar alt="Sitemark Store">
            <DevicesRoundedIcon sx={{ fontSize: "1.1rem" }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary="Sitemark-Store"
          secondary="Web app"
          primaryTypographyProps={{
            sx: { color: "#f8fafc", fontWeight: 500, fontSize: "0.9rem" },
          }}
          secondaryTypographyProps={{
            sx: { color: "rgba(248, 250, 252, 0.6)", fontSize: "0.8rem" },
          }}
        />
      </StyledMenuItem>
      <StyledListSubheader>Development</StyledListSubheader>
      <StyledMenuItem value={30}>
        <ListItemAvatar>
          <Avatar alt="Sitemark Store">
            <ConstructionRoundedIcon sx={{ fontSize: "1.1rem" }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary="Sitemark-Admin"
          secondary="Web app"
          primaryTypographyProps={{
            sx: { color: "#f8fafc", fontWeight: 500, fontSize: "0.9rem" },
          }}
          secondaryTypographyProps={{
            sx: { color: "rgba(248, 250, 252, 0.6)", fontSize: "0.8rem" },
          }}
        />
      </StyledMenuItem>
      <Divider
        sx={{
          mx: 1,
          my: 1,
          borderColor: "rgba(0, 212, 255, 0.1)",
        }}
      />
      <StyledMenuItem value={40}>
        <ListItemIcon sx={{ color: "#00d4ff", minWidth: "40px" }}>
          <AddRoundedIcon />
        </ListItemIcon>
        <ListItemText
          primary="Add product"
          secondary="Web app"
          primaryTypographyProps={{
            sx: { color: "#00d4ff", fontWeight: 600, fontSize: "0.9rem" },
          }}
          secondaryTypographyProps={{
            sx: { color: "rgba(0, 212, 255, 0.7)", fontSize: "0.8rem" },
          }}
        />
      </StyledMenuItem>
    </Select>
  );
}
