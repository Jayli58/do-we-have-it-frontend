"use client";

import {
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
      <DialogTitle>Template details</DialogTitle>
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
