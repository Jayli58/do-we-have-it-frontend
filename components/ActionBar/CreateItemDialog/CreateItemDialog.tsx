"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import InventoryIcon from "@mui/icons-material/Inventory2";

import type { FormField, ItemAttribute } from "@/types";

interface CreateItemDialogProps {
  open: boolean;
  fields?: FormField[];
  templateName?: string | null;
  onOpenTemplateImport?: () => void;
  resetKey?: number;
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
  resetKey,
  onClose,
  onCreate,
}: CreateItemDialogProps) {
  const [name, setName] = useState("");
  const [comments, setComments] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [nameTouched, setNameTouched] = useState(false);
  const [attributeTouched, setAttributeTouched] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (resetKey !== undefined) {
      setName("");
      setComments("");
      setAttributes({});
      setNameTouched(false);
      setAttributeTouched({});
    }
  }, [resetKey]);

  const requiredMissing = useMemo(() => {
    const missing: string[] = [];
    if (!name.trim()) {
      missing.push("name");
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

  const nameError = nameTouched && !name.trim();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="create-item-title"
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
            <InventoryIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Box flex={1}>
            <Box display="flex" alignItems="flex-start" justifyContent="space-between">
              <Typography id="create-item-title" variant="h6" fontWeight={700}>
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
            <Stack spacing={1} paddingTop={2}>
          <TextField
            label="Item name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => setNameTouched(true)}
            error={nameError}
            helperText={nameError ? "Item name is required." : " "}
          />
          {(fields ?? []).length > 0 && (
            <Box>
              <Stack spacing={1}>
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
                    onBlur={() =>
                      setAttributeTouched((prev) => ({
                        ...prev,
                        [field.id]: true,
                      }))
                    }
                    error={
                      Boolean(attributeTouched[field.id]) &&
                      requiredMissing.includes(field.id)
                    }
                    helperText={
                      Boolean(attributeTouched[field.id]) &&
                      requiredMissing.includes(field.id)
                        ? "Required"
                        : " "
                    }
                  />
                ))}
              </Stack>
            </Box>
          )}
            <TextField
              label="Comments"
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              helperText="Optional"
              multiline
              minRows={3}
            />
            </Stack>
          </Box>
        </Box>
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
