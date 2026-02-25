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
      className="mat-card actionbar-sticky"
      elevation={0}
    >
      <Box className="mainpage-actionbar">
        <Box className="mainpage-actions-items">
          <Button
            variant="outlined"
            startIcon={<CreateNewFolderIcon />}
            onClick={onCreateFolder}
            disabled={!onCreateFolder}
            className="dialog-btn-secondary order-1"
          >
            + Folder
          </Button>
          <Button
            variant="contained"
            startIcon={<Inventory2OutlinedIcon />}
            onClick={onCreateItem}
            disabled={!onCreateItem}
            className="dialog-btn-primary order-2"
          >
            + Item
          </Button>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ViewListIcon />}
          onClick={onManageTemplates}
          disabled={!onManageTemplates}
          className="dialog-btn-secondary actionbar-template-btn order-3"
        >
          Templates
        </Button>
      </Box>
    </Paper>
  );
}
