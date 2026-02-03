"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";

import type { FormTemplate } from "@/types";

interface ImportTemplateDialogProps {
  open: boolean;
  templates: FormTemplate[];
  onClose: () => void;
  onSelect: (template: FormTemplate) => void;
}

export default function ImportTemplateDialog({
  open,
  templates,
  onClose,
  onSelect,
}: ImportTemplateDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Box className="dialog-icon-blue">
            <FileUploadIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Import template
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {templates.length === 0 ? (
          <Typography color="text.secondary">
            No templates available yet.
          </Typography>
        ) : (
          <List>
            {templates.map((template) => (
              <ListItemButton
                key={template.id}
                onClick={() => onSelect(template)}
              >
                <ListItemText
                  primary={template.name}
                  secondary={`${template.fields.length} fields`}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
