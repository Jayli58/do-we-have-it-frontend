"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import type { FormField } from "@/types";

interface CreateFormTemplateDialogProps {
  open: boolean;
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
  onClose,
  onSave,
}: CreateFormTemplateDialogProps) {
  const [name, setName] = useState("");
  const [fields, setFields] = useState<FormField[]>([createField()]);

  useEffect(() => {
    if (open) {
      setName("");
      setFields([createField()]);
    }
  }, [open]);

  const validation = useMemo(() => {
    if (!name.trim()) {
      return "Template name is required.";
    }
    if (fields.some((field) => !field.name.trim())) {
      return "Each field needs a name.";
    }
    return "";
  }, [fields, name]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create template</DialogTitle>
      <DialogContent>
        <Stack spacing={2} paddingTop={1}>
          <TextField
            label="Template name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={Boolean(validation) && !name.trim()}
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
          {validation && (
            <Typography color="error" variant="body2">
              {validation}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => onSave({ name: name.trim(), fields })}
          disabled={Boolean(validation)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
