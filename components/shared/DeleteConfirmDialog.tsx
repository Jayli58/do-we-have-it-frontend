"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

interface DeleteConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Box className="dialog-icon-blue">
            <DeleteForeverIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            {title ?? "Delete"}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">
          {description ?? "Are you sure you want to delete this?"}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          {confirmLabel ?? "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
