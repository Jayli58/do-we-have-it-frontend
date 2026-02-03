"use client";

import { Box, Button, Paper } from "@mui/material";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ViewListIcon from "@mui/icons-material/ViewList";

interface ActionBarProps {
  onCreateFolder?: () => void;
  onCreateItem?: () => void;
  onManageTemplates?: () => void;
}

export default function ActionBar({
  onCreateFolder,
  onCreateItem,
  onManageTemplates,
}: ActionBarProps) {
  return (
    <Paper
      className="mat-card"
      elevation={0}
      sx={{
        position: "sticky",
        bottom: 20,
        padding: 2,
        zIndex: 10,
      }}
    >
      <Box
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
      >
        <Box display="flex" flexWrap="wrap" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            startIcon={<CreateNewFolderIcon />}
            onClick={onCreateFolder}
            disabled={!onCreateFolder}
          >
            + Folder
          </Button>
          <Button
            variant="contained"
            startIcon={<Inventory2OutlinedIcon />}
            onClick={onCreateItem}
            disabled={!onCreateItem}
          >
            + Item
          </Button>
        </Box>
        <Button
          variant="text"
          startIcon={<ViewListIcon />}
          onClick={onManageTemplates}
          disabled={!onManageTemplates}
        >
          Templates
        </Button>
      </Box>
    </Paper>
  );
}
