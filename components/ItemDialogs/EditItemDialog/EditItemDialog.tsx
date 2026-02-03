"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  Box,
} from "@mui/material";

import type { FormField, Item, ItemAttribute } from "@/types";

interface EditItemDialogProps {
  open: boolean;
  item: Item | null;
  fields?: FormField[];
  onClose: () => void;
  onSave: (data: {
    id: string;
    name: string;
    comments: string;
    attributes: ItemAttribute[];
  }) => void;
}

export default function EditItemDialog({
  open,
  item,
  fields,
  onClose,
  onSave,
}: EditItemDialogProps) {
  const [name, setName] = useState("");
  const [comments, setComments] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item && open) {
      setName(item.name);
      setComments(item.comments);
      const nextAttributes: Record<string, string> = {};
      item.attributes.forEach((attribute) => {
        nextAttributes[attribute.fieldId] = attribute.value;
      });
      setAttributes(nextAttributes);
    }
  }, [item, open]);

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
    if (!item) {
      return;
    }
    const mappedAttributes: ItemAttribute[] = (fields ?? []).map((field) => ({
      fieldId: field.id,
      fieldName: field.name,
      value: attributes[field.id] ?? "",
    }));
    onSave({
      id: item.id,
      name: name.trim(),
      comments: comments.trim(),
      attributes: mappedAttributes,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit item</DialogTitle>
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
          disabled={requiredMissing.length > 0 || !item}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
