"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

import type { FormTemplate } from "@/types";

interface ViewFormTemplateDialogProps {
  open: boolean;
  template: FormTemplate | null;
  onClose: () => void;
}

export default function ViewFormTemplateDialog({
  open,
  template,
  onClose,
}: ViewFormTemplateDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Box className="dialog-icon-blue">
            <VisibilityIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Template details
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {template ? (
          <>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {template.name}
            </Typography>
            <List dense>
              {template.fields.map((field) => (
                <ListItem key={field.id} disableGutters>
                  <ListItemText
                    primary={field.name}
                    secondary={field.required ? "Required" : "Optional"}
                  />
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Typography color="text.secondary">No template selected.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
