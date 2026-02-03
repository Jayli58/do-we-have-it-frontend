"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ViewListIcon from "@mui/icons-material/ViewList";

import CreateFormTemplateDialog from "@/components/FormTemplateManager/CreateFormTemplateDialog/CreateFormTemplateDialog";
import EditFormTemplateDialog from "@/components/FormTemplateManager/EditFormTemplateDialog/EditFormTemplateDialog";
import ViewFormTemplateDialog from "@/components/FormTemplateManager/ViewFormTemplateDialog/ViewFormTemplateDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { useFormTemplateStore } from "@/store/formTemplateStore";
import type { FormTemplate } from "@/types";

interface FormTemplateManagerProps {
  open: boolean;
  onClose: () => void;
}

export default function FormTemplateManager({
  open,
  onClose,
}: FormTemplateManagerProps) {
  const {
    templates,
    loadTemplates,
    addTemplate,
    editTemplate,
    removeTemplate,
  } = useFormTemplateStore();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [viewTemplate, setViewTemplate] = useState<FormTemplate | null>(null);
  const [editTemplateData, setEditTemplateData] = useState<FormTemplate | null>(
    null,
  );
  const [deleteTemplateData, setDeleteTemplateData] =
    useState<FormTemplate | null>(null);
  const [createTemplateResetKey, setCreateTemplateResetKey] = useState(0);

  useEffect(() => {
    if (open) {
      void loadTemplates();
    }
  }, [loadTemplates, open]);

  const sortedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => a.name.localeCompare(b.name));
  }, [templates]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Box className="dialog-icon-blue" sx={{ marginTop: 0.5 }}>
            <ViewListIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Form templates
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {sortedTemplates.length === 0 ? (
          <Typography color="text.secondary">
            No templates yet. Create one to reuse custom fields.
          </Typography>
        ) : (
          <List>
            {sortedTemplates.map((template) => (
              <ListItem key={template.id} divider disablePadding>
                <ListItemText
                  onClick={() => setViewTemplate(template)}
                  primary={template.name}
                  secondary={`${template.fields.length} fields`}
                  sx={{ paddingY: 1.5, paddingLeft: 2, cursor: "pointer" }}
                />
                <Box display="flex" gap={1} paddingRight={1.5}>
                  <IconButton
                    aria-label="view template"
                    onClick={() => setViewTemplate(template)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="edit template"
                    onClick={() => setEditTemplateData(template)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="delete template"
                    onClick={() => setDeleteTemplateData(template)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Stack width="100%" direction="row" justifyContent="flex-end" gap={1.5}>
          <Button onClick={onClose}>Close</Button>
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            Create template
          </Button>
        </Stack>
      </DialogActions>

      <CreateFormTemplateDialog
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        existingNames={templates.map((template) => template.name)}
        resetKey={createTemplateResetKey}
        onSave={async (data) => {
          await addTemplate({ name: data.name, fields: data.fields });
          setCreateTemplateResetKey((prev) => prev + 1);
          setCreateOpen(false);
        }}
      />

      <ViewFormTemplateDialog
        open={Boolean(viewTemplate)}
        template={viewTemplate}
        onClose={() => setViewTemplate(null)}
      />

      <EditFormTemplateDialog
        open={Boolean(editTemplateData)}
        template={editTemplateData}
        onClose={() => setEditTemplateData(null)}
        existingNames={templates.map((template) => template.name)}
        onSave={async (data) => {
          await editTemplate(data.id, {
            name: data.name,
            fields: data.fields,
          });
          setEditTemplateData(null);
        }}
      />

      <DeleteConfirmDialog
        open={Boolean(deleteTemplateData)}
        onCancel={() => setDeleteTemplateData(null)}
        onConfirm={async () => {
          if (deleteTemplateData) {
            await removeTemplate(deleteTemplateData.id);
          }
          setDeleteTemplateData(null);
        }}
        title="Delete template"
        description={
          deleteTemplateData
            ? `Delete "${deleteTemplateData.name}"?`
            : "Are you sure you want to delete this template?"
        }
      />
    </Dialog>
  );
}
