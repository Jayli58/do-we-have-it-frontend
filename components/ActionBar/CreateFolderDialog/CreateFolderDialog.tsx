"use client";

import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
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
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

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
  const hasUserInteracted = useRef(false);

  useEffect(() => {
    if (resetKey !== undefined) {
      setName("");
      setTouched(false);
      hasUserInteracted.current = false;
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

  const handleSubmit = () => {
    if (validation) {
      setTouched(true);
      return;
    }
    onCreate(name.trim());
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!hasUserInteracted.current) {
      hasUserInteracted.current = true;
    }
    if (!touched) {
      setTouched(true);
    }
    setName(event.target.value);
  };

  const handlePointerDown = () => {
    hasUserInteracted.current = true;
  };

  const handleKeyDown = () => {
    hasUserInteracted.current = true;
  };

  const handleBlur = () => {
    if (hasUserInteracted.current) {
      setTouched(true);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="create-folder-title"
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
            <CreateNewFolderIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Box flex={1}>
            <Typography id="create-folder-title" variant="h6" fontWeight={700}>
              Create folder
            </Typography>
            <Stack spacing={1} paddingTop={2} />
            <TextField
              autoFocus
              margin="dense"
              fullWidth
              label="Folder name"
              value={name}
              onChange={handleChange}
              onPointerDown={handlePointerDown}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              error={showError}
              helperText={showError ? validation : " "}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={Boolean(validation)}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
