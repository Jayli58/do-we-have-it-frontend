"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

import type { Folder } from "@/types";

interface EditFolderDialogProps {
  open: boolean;
  folder: Folder | null;
  existingNames?: string[];
  onClose: () => void;
  onSave: (id: string, name: string) => void;
}

export default function EditFolderDialog({
  open,
  folder,
  existingNames,
  onClose,
  onSave,
}: EditFolderDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (folder && open) {
      setName(folder.name);
    }
  }, [folder, open]);

  const validation = useMemo(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      return "Folder name is required.";
    }
    if (
      existingNames?.some((existing) => {
        if (existing.toLowerCase() === folder?.name.toLowerCase()) {
          return false;
        }
        return existing.toLowerCase() === trimmed.toLowerCase();
      })
    ) {
      return "Folder name must be unique.";
    }
    return "";
  }, [existingNames, folder?.name, name]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit folder</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          label="Folder name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={Boolean(validation)}
          helperText={validation || " "}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => folder && onSave(folder.id, name.trim())}
          disabled={Boolean(validation) || !folder}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
