"use client";

import { useMemo, useRef, useState } from "react";
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
import PostAddIcon from "@mui/icons-material/PostAdd";

import { FIELD_MAX } from "@/constants/limits";
import type { FormField } from "@/types";

interface CreateFormTemplateDialogProps {
  open: boolean;
  existingNames?: string[];
  resetKey?: number;
  onClose: () => void;
  onSave: (data: { name: string; fields: FormField[] }) => void;
}

const createField = (): FormField => ({
  id: `field-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`,
  name: "",
  type: "text",
  required: false,
});

export default function CreateFormTemplateDialog({
  open,
  existingNames,
  resetKey,
  onClose,
  onSave,
}: CreateFormTemplateDialogProps) {
  const [name, setName] = useState("");
  const [fields, setFields] = useState<FormField[]>([createField()]);
  const [nameTouched, setNameTouched] = useState(false);
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const lastResetKeyRef = useRef(resetKey);

  const resetForm = () => {
    setName("");
    setFields([createField()]);
    setNameTouched(false);
    setFieldTouched({});
  };

  const validation = useMemo(() => {
    if (!name.trim()) {
      return "Template name is required.";
    }
    if (fields.some((field) => !field.name.trim())) {
      return "Each field needs a name.";
    }
    if (
      existingNames?.some(
        (existing) => existing.toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      return "Template name must be unique.";
    }
    return "";
  }, [existingNames, fields, name]);

  const showNameError = nameTouched && !name.trim();
  const shouldShowValidation = !isSaving;
  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await onSave({ name: name.trim(), fields });
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
      aria-labelledby="create-template-title"
      TransitionProps={{
        onExited: () => {
          if (resetKey !== undefined && resetKey !== lastResetKeyRef.current) {
            resetForm();
            lastResetKeyRef.current = resetKey;
          }
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
            <PostAddIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Box flex={1}>
            <Typography id="create-template-title" variant="h6" fontWeight={700}>
              Create template
            </Typography>
            <Stack spacing={2} paddingTop={1}>
          <TextField
            label="Template name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => setNameTouched(true)}
            error={
              shouldShowValidation &&
              (showNameError || (nameTouched && validation.includes("unique")))
            }
            helperText={
              nameTouched && validation && shouldShowValidation ? validation : " "
            }
            slotProps={{ htmlInput: { maxLength: FIELD_MAX } }}
          />
          <Stack spacing={2}>
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
                    shouldShowValidation &&
                    Boolean(fieldTouched[field.id]) &&
                    !field.name.trim()
                  }
                  helperText={
                    shouldShowValidation &&
                    Boolean(fieldTouched[field.id]) &&
                    !field.name.trim()
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
          {validation && nameTouched && shouldShowValidation && (
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
          disabled={Boolean(validation) || isSaving}
          className="dialog-btn-primary"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
