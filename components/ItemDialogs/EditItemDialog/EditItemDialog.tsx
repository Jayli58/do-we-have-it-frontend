"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  const [nameTouched, setNameTouched] = useState(false);
  const [commentsTouched, setCommentsTouched] = useState(false);
  const [attributeTouched, setAttributeTouched] = useState<
    Record<string, boolean>
  >({});
  const lastItemId = useRef<string | null>(null);

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
      setCommentsTouched(false);
      setAttributeTouched({});
      lastItemId.current = item.id;
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
    if (requiredMissing.length > 0) {
      setNameTouched(true);
      setCommentsTouched(true);
      setAttributeTouched((prev) => {
        const next = { ...prev };
        requiredMissing.forEach((fieldId) => {
          if (fieldId !== "name" && fieldId !== "comments") {
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
    onSave({
      id: item.id,
      name: name.trim(),
      comments: comments.trim(),
      attributes: mappedAttributes,
    });
  };

  const nameError = nameTouched && !name.trim();
  const commentsError = commentsTouched && !comments.trim();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Box className="dialog-icon-blue" sx={{ marginTop: 0.5 }}>
            <EditNoteIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Edit item
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} paddingTop={1}>
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
            onBlur={() => setCommentsTouched(true)}
            error={commentsError}
            helperText={commentsError ? "Comments are required." : " "}
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!item}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
