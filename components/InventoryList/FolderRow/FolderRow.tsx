"use client";

import { Box, Card, IconButton, Typography } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import type { Folder } from "@/types";

interface FolderRowProps {
  folder: Folder;
  onOpen?: (folder: Folder) => void;
  onEdit?: (folder: Folder) => void;
  onDelete?: (folder: Folder) => void;
}

export default function FolderRow({
  folder,
  onOpen,
  onEdit,
  onDelete,
}: FolderRowProps) {
  return (
    <Card className="mat-card mat-card-compact" sx={{ padding: 0 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          sx={{ cursor: onOpen ? "pointer" : "default" }}
          onClick={() => onOpen?.(folder)}
        >
          <FolderIcon color="action" />
          <Typography
            variant="subtitle1"
            sx={{ textDecoration: "underline", fontWeight: 600 }}
          >
            {folder.name}/
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <IconButton aria-label="edit folder" onClick={() => onEdit?.(folder)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="delete folder"
            onClick={() => onDelete?.(folder)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}
