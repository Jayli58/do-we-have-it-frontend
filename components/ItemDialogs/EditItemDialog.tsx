"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";

import type { FormField, Item, ItemAttribute } from "@/types";

interface EditItemDialogProps {
  open: boolean;
  item: Item | null;
  fields?: FormField[];
  existingNames?: string[];
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
  existingNames,
  onClose,
  onSave,
}: EditItemDialogProps) {
  const [name, setName] = useState("");
  const [comments, setComments] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [nameTouched, setNameTouched] = useState(false);
  const [attributeTouched, setAttributeTouched] = useState<
    Record<string, boolean>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const lastItemId = useRef<string | null>(null);
  const originalNameRef = useRef<string>("");

  useEffect(() => {
    if (item && open) {
      setName(item.name);
      setComments(item.comments);
      const nextAttributes: Record<string, string> = {};
      item.attributes.forEach((attribute) => {
        nextAttributes[attribute.fieldId] = attribute.value;
      });
      setAttributes(nextAttributes);
      setNameTouched(false);
      setAttributeTouched({});
      lastItemId.current = item.id;
      originalNameRef.current = item.name;
    }
  }, [item, open]);

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
    if (!item) {
      return;
    }
    if (isSaving) {
      return;
    }
    if (isDuplicateName) {
      setNameTouched(true);
      return;
    }
    if (requiredMissing.length > 0) {
      setNameTouched(true);
      setAttributeTouched((prev) => {
        const next = { ...prev };
        requiredMissing.forEach((fieldId) => {
          if (fieldId !== "name") {
            next[fieldId] = true;
          }
        });
        return next;
      });
      return;
    }
    const mappedAttributes: ItemAttribute[] = (fields ?? []).map((field) => ({
      fieldId: field.id,
      fieldName: field.name,
      value: attributes[field.id] ?? "",
    }));
    setIsSaving(true);
    try {
      await Promise.resolve(
        onSave({
          id: item.id,
          name: name.trim(),
          comments: comments.trim(),
          attributes: mappedAttributes,
        }),
      );
    } catch (error) {
      setIsSaving(false);
    }
  };

  const trimmedName = name.trim();
  const originalName = originalNameRef.current.trim().toLowerCase();
  const isDuplicateName = Boolean(
    trimmedName &&
      existingNames?.some(
        (existing) => existing.toLowerCase() === trimmedName.toLowerCase(),
      ) &&
      trimmedName.toLowerCase() !== originalName,
  );
  const nameError = nameTouched && (!trimmedName || isDuplicateName);
  const nameHelperText = nameTouched
    ? !trimmedName
      ? "Item name is required."
      : isDuplicateName
        ? "Item name must be unique in this folder."
        : " "
    : " ";
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="edit-item-title"
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
            <Typography id="edit-item-title" variant="h6" fontWeight={700}>
              Edit item
            </Typography>
            <Stack spacing={1} paddingTop={4}>
          <TextField
            label="Item name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => setNameTouched(true)}
            error={nameError}
            helperText={nameHelperText}
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
          disabled={!item || isDuplicateName || isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
