"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="import-template-title"
    >
      <DialogContent>
        <Box
          display="flex"
          gap={2}
          alignItems="flex-start"
          flexDirection={{ xs: "column", sm: "row" }}
        >
          <Box
            className="dialog-icon-blue"
            sx={{ alignSelf: { xs: "center", sm: "flex-start" } }}
          >
            <FileUploadIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Box flex={1}>
            <Typography id="import-template-title" variant="h6" fontWeight={700}>
              Import template
            </Typography>
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
                      secondary={`${template.fields.length + 2} fields`}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className="dialog-footer">
        <Button onClick={onClose} className="dialog-btn-secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
