"use client";

import { useEffect, useMemo, useState } from "react";
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
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";

interface CreateFolderDialogProps {
  open: boolean;
  existingNames?: string[];
  resetKey?: number;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export default function CreateFolderDialog({
  open,
  existingNames,
  resetKey,
  onClose,
  onCreate,
}: CreateFolderDialogProps) {
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (resetKey !== undefined) {
      setName("");
      setTouched(false);
    }
  }, [resetKey]);

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

  const showError = touched && Boolean(validation);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Box className="dialog-icon-blue">
            <CreateNewFolderIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Create folder
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
