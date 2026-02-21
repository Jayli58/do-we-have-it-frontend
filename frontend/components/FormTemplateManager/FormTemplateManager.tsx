"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  List,
  ListItem,
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
import { DEFAULT_TEMPLATE_ID } from "@/api/formTemplates";
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
    return [...templates].sort((a, b) => {
      if (a.id === DEFAULT_TEMPLATE_ID) {
        return -1;
      }
      if (b.id === DEFAULT_TEMPLATE_ID) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [templates]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="form-templates-title"
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
            <ViewListIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Box flex={1}>
            <Typography id="form-templates-title" variant="h6" fontWeight={700}>
              Form templates
            </Typography>
            {sortedTemplates.length === 0 ? (
              <Typography color="text.secondary" paddingTop={1}>
                No templates yet. Create one to reuse custom fields.
              </Typography>
            ) : (
              <List>
                {sortedTemplates.map((template) => {
                  const isDefault = template.id === DEFAULT_TEMPLATE_ID;
                  return (
                    <ListItem key={template.id} divider disablePadding>
                      <Box className="form-template-meta">
                        <Typography
                          onClick={() => setViewTemplate(template)}
                          sx={{ cursor: "pointer", fontWeight: 600 }}
                        >
                          {template.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          onClick={() => setViewTemplate(template)}
                          sx={{ cursor: "pointer" }}
                        >
                          {`${template.fields.length + 2} fields`}
                        </Typography>
                      </Box>
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
                          disabled={isDefault}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          aria-label="delete template"
                          onClick={() => {
                            if (!isDefault) {
                              setDeleteTemplateData(template);
                            }
                          }}
                          disabled={isDefault}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className="dialog-footer">
        <Button onClick={onClose} className="dialog-btn-secondary">
          Close
        </Button>
        <Button
          variant="contained"
          onClick={() => setCreateOpen(true)}
          className="dialog-btn-primary"
        >
          Create template
        </Button>
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
