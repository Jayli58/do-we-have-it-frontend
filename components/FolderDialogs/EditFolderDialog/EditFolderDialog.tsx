"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";

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
  const [touched, setTouched] = useState(false);
  const lastFolderId = useRef<string | null>(null);

  const handleClose = () => {
    setTouched(false);
    onClose();
  };

  useEffect(() => {
    if (folder && folder.id !== lastFolderId.current) {
      setName(folder.name);
      setTouched(false);
      lastFolderId.current = folder.id;
    }
  }, [folder]);

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

  const showError = touched && Boolean(validation);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Box className="dialog-icon-blue" sx={{ marginTop: 0.5 }}>
            <DriveFileRenameOutlineIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Edit folder
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          label="Folder name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => setTouched(true)}
          error={showError}
          helperText={showError ? validation : " "}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
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
