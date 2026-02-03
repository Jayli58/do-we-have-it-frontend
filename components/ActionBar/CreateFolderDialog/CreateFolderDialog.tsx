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

interface CreateFolderDialogProps {
  open: boolean;
  existingNames?: string[];
  onClose: () => void;
  onCreate: (name: string) => void;
}

export default function CreateFolderDialog({
  open,
  existingNames,
  onClose,
  onCreate,
}: CreateFolderDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
    }
  }, [open]);

  const validation = useMemo(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      return "Folder name is required.";
    }
    if (
      existingNames?.some(
        (existing) => existing.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      return "Folder name must be unique.";
    }
    return "";
  }, [existingNames, name]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create folder</DialogTitle>
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
          onClick={() => onCreate(name.trim())}
          disabled={Boolean(validation)}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
