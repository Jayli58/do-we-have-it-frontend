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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";

import type { FormField, ItemAttribute } from "@/types";

interface CreateItemDialogProps {
  open: boolean;
  fields?: FormField[];
  templateName?: string | null;
  onOpenTemplateImport?: () => void;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    comments: string;
    attributes: ItemAttribute[];
  }) => void;
}

export default function CreateItemDialog({
  open,
  fields,
  templateName,
  onOpenTemplateImport,
  onClose,
  onCreate,
}: CreateItemDialogProps) {
  const [name, setName] = useState("");
  const [comments, setComments] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setName("");
      setComments("");
      setAttributes({});
    }
  }, [open]);

  const requiredMissing = useMemo(() => {
    const missing: string[] = [];
    if (!name.trim()) {
      missing.push("name");
    }
    if (!comments.trim()) {
      missing.push("comments");
    }
    (fields ?? []).forEach((field) => {
      if (field.required && !attributes[field.id]?.trim()) {
        missing.push(field.id);
      }
    });
    return missing;
  }, [attributes, comments, fields, name]);

  const handleSubmit = () => {
    const mappedAttributes: ItemAttribute[] = (fields ?? []).map((field) => ({
      fieldId: field.id,
      fieldName: field.name,
      value: attributes[field.id] ?? "",
    }));
    onCreate({
      name: name.trim(),
      comments: comments.trim(),
      attributes: mappedAttributes,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={700}>
            Create item
          </Typography>
          {onOpenTemplateImport && (
            <IconButton
              aria-label="import template"
              onClick={onOpenTemplateImport}
            >
              <FileUploadIcon />
            </IconButton>
          )}
        </Box>
        {templateName && (
          <Typography variant="body2" color="text.secondary">
            Using template: {templateName}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} paddingTop={1}>
          <TextField
            label="Item name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={requiredMissing.includes("name")}
            helperText={
              requiredMissing.includes("name")
                ? "Item name is required."
                : " "
            }
          />
          <TextField
            label="Comments"
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            error={requiredMissing.includes("comments")}
            helperText={
              requiredMissing.includes("comments")
                ? "Comments are required."
                : " "
            }
            multiline
            minRows={3}
          />
          {(fields ?? []).length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Attributes
              </Typography>
              <Stack spacing={2}>
                {(fields ?? []).map((field) => (
                  <TextField
                    key={field.id}
                    label={field.name}
                    value={attributes[field.id] ?? ""}
                    onChange={(event) =>
                      setAttributes((prev) => ({
                        ...prev,
                        [field.id]: event.target.value,
                      }))
                    }
                    error={requiredMissing.includes(field.id)}
                    helperText={
                      requiredMissing.includes(field.id)
                        ? "Required"
                        : " "
                    }
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={requiredMissing.length > 0}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
