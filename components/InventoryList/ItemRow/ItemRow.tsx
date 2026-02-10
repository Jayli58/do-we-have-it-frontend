"use client";

import { Box, Card, IconButton, Typography } from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory2";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import type { Item } from "@/types";

interface ItemRowProps {
  item: Item;
  onView?: (item: Item) => void;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
}

export default function ItemRow({ item, onView, onEdit, onDelete }: ItemRowProps) {
  return (
    <Card className="mat-card mat-card-compact" sx={{ padding: 0 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          sx={{ cursor: onView ? "pointer" : "default" }}
          onClick={() => onView?.(item)}
        >
          <InventoryIcon color="action" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {item.name}
          </Typography>
        </Box>
        <Box display="flex" className="item-row-actions">
          <IconButton aria-label="view item" onClick={() => onView?.(item)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton aria-label="edit item" onClick={() => onEdit?.(item)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton aria-label="delete item" onClick={() => onDelete?.(item)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}
