"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditNoteIcon from "@mui/icons-material/EditNote";

import { FIELD_MAX } from "@/constants/limits";
import type { FormField, FormTemplate } from "@/types";

interface EditFormTemplateDialogProps {
  open: boolean;
  template: FormTemplate | null;
  existingNames?: string[];
  onClose: () => void;
  onSave: (data: { id: string; name: string; fields: FormField[] }) => void;
}

const createField = (): FormField => ({
  id: `field-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`,
  name: "",
  type: "text",
  required: false,
});

export default function EditFormTemplateDialog({
  open,
  template,
  existingNames,
  onClose,
  onSave,
}: EditFormTemplateDialogProps) {
  const [name, setName] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [nameTouched, setNameTouched] = useState(false);
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const lastTemplateId = useRef<string | null>(null);

  useEffect(() => {
    if (template && template.id !== lastTemplateId.current) {
      setName(template.name);
      setFields(template.fields.length ? template.fields : [createField()]);
      setNameTouched(false);
      setFieldTouched({});
      lastTemplateId.current = template.id;
    }
  }, [template]);

  const validation = useMemo(() => {
    if (!name.trim()) {
      return "Template name is required.";
    }
    if (fields.some((field) => !field.name.trim())) {
      return "Each field needs a name.";
    }
    if (
      existingNames?.some((existing) => {
        if (existing.toLowerCase() === template?.name.toLowerCase()) {
          return false;
        }
        return existing.toLowerCase() === name.trim().toLowerCase();
      })
    ) {
      return "Template name must be unique.";
    }
    return "";
  }, [existingNames, fields, name, template?.name]);

  const showNameError = nameTouched && !name.trim();
  const handleSave = async () => {
    if (!template || validation || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await Promise.resolve(
        onSave({ id: template.id, name: name.trim(), fields }),
      );
    } catch (error) {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="edit-template-title"
      TransitionProps={{
        onExited: () => {
          setIsSaving(false);
        },
      }}
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
            <EditNoteIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Box flex={1}>
            <Typography id="edit-template-title" variant="h6" fontWeight={700}>
              Edit template
            </Typography>
            <Stack spacing={1} paddingTop={4}>
          <TextField
            label="Template name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => setNameTouched(true)}
            error={showNameError || (nameTouched && validation.includes("unique"))}
            helperText={nameTouched && validation ? validation : " "}
            slotProps={{ htmlInput: { maxLength: FIELD_MAX } }}
          />
          <Stack spacing={1}>
            {fields.map((field, index) => (
              <Box
                key={field.id}
                display="grid"
                gridTemplateColumns="1fr auto auto"
                gap={1}
                alignItems="center"
              >
                <TextField
                  label={`Field ${index + 1}`}
                  value={field.name}
                  onChange={(event) =>
                    setFields((prev) =>
                      prev.map((entry) =>
                        entry.id === field.id
                          ? { ...entry, name: event.target.value }
                          : entry,
                      ),
                    )
                  }
                  onBlur={() =>
                    setFieldTouched((prev) => ({
                      ...prev,
                      [field.id]: true,
                    }))
                  }
                  error={
                    Boolean(fieldTouched[field.id]) && !field.name.trim()
                  }
                  helperText={
                    Boolean(fieldTouched[field.id]) && !field.name.trim()
                      ? "Field name is required."
                      : " "
                  }
                  slotProps={{ htmlInput: { maxLength: FIELD_MAX } }}
                />
                <Box display="flex" alignItems="center">
                  <Checkbox
                    checked={field.required}
                    onChange={(event) =>
                      setFields((prev) =>
                        prev.map((entry) =>
                          entry.id === field.id
                            ? { ...entry, required: event.target.checked }
                            : entry,
                        ),
                      )
                    }
                  />
                  <Typography variant="body2">Required</Typography>
                </Box>
                <IconButton
                  aria-label="remove field"
                  onClick={() =>
                    setFields((prev) =>
                      prev.length > 1
                        ? prev.filter((entry) => entry.id !== field.id)
                        : prev,
                    )
                  }
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
          <Button
            variant="outlined"
            onClick={() => setFields((prev) => [...prev, createField()])}
          >
            Add field
          </Button>
          {validation && nameTouched && (
            <Typography color="error" variant="body2">
              {validation}
            </Typography>
          )}
            </Stack>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className="dialog-footer">
        <Button onClick={onClose} className="dialog-btn-secondary">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={Boolean(validation) || !template || isSaving}
          className="dialog-btn-primary"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
