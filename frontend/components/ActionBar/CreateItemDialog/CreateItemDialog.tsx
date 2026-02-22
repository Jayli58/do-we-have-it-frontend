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

import { COMMENT_MAX, FIELD_MAX } from "@/constants/limits";
import ImageUploadField from "@/components/shared/ImageUploadField/ImageUploadField";
import type { FormField, ItemAttribute } from "@/types";

interface CreateItemDialogProps {
  open: boolean;
  fields?: FormField[];
  templateName?: string | null;
  onOpenTemplateImport?: () => void;
  existingNames?: string[];
  resetKey?: number;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    comments: string;
    attributes: ItemAttribute[];
    imageName: string | null;
    imageFile: File | null;
  }) => void;
}

export default function CreateItemDialog({
  open,
  fields,
  templateName,
  onOpenTemplateImport,
  existingNames,
  resetKey,
  onClose,
  onCreate,
}: CreateItemDialogProps) {
  const [name, setName] = useState("");
  const [comments, setComments] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [attributeTouched, setAttributeTouched] = useState<
    Record<string, boolean>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (resetKey !== undefined) {
      setName("");
      setComments("");
      setAttributes({});
      setImageName(null);
      setImageFile(null);
      setImageError("");
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

  const handleSubmit = async () => {
    if (isSaving || requiredMissing.length > 0 || isDuplicateName || imageError) {
      return;
    }

    setIsSaving(true);
    const mappedAttributes: ItemAttribute[] = (fields ?? []).map((field) => ({
      fieldId: field.id,
      fieldName: field.name,
      value: attributes[field.id] ?? "",
    }));
    try {
      await Promise.resolve(
        onCreate({
          name: name.trim(),
          comments: comments.trim(),
          attributes: mappedAttributes,
          imageName,
          imageFile,
        }),
      );
    } catch (error) {
      setIsSaving(false);
    }
  };

  const trimmedName = name.trim();
  const isDuplicateName = Boolean(
    trimmedName &&
      existingNames?.some(
        (existing) => existing.toLowerCase() === trimmedName.toLowerCase(),
      ),
  );
  const nameError = nameTouched && (!trimmedName || isDuplicateName);
  const nameHelperText = nameTouched
    ? !trimmedName
      ? "Item name is required."
      : isDuplicateName
        ? "Item name must be unique in this folder."
        : " "
    : " ";

  const handleImageChange = (payload: {
    file: File | null;
    name: string | null;
    error: string;
  }) => {
    setImageError(payload.error);
    setImageFile(payload.file);
    setImageName(payload.name ?? null);
  };

  const handleImageRemove = () => {
    setImageName(null);
    setImageFile(null);
    setImageError("");
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="create-item-title"
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
          className="dialog-flex-direction"
        >
          <Box className="dialog-icon-blue dialog-icon-align">
            <InventoryIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Box className="dialog-content-column">
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
            helperText={nameHelperText}
            slotProps={{ htmlInput: { maxLength: FIELD_MAX } }}
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
                    helperText={field.required ? "Required" : " "}
                    slotProps={{ htmlInput: { maxLength: FIELD_MAX } }}
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
              slotProps={{ htmlInput: { maxLength: COMMENT_MAX } }}
            />
            <ImageUploadField
              imageName={imageName}
              imageError={imageError}
              onFileChange={handleImageChange}
              onRemove={handleImageRemove}
            />
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
          onClick={handleSubmit}
          disabled={
            requiredMissing.length > 0 ||
            isDuplicateName ||
            isSaving ||
            Boolean(imageError)
          }
          className="dialog-btn-primary"
        >
          {isSaving ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
