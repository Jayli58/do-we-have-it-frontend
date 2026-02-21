"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
} from "@mui/material";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";

import { FIELD_MAX } from "@/constants/limits";
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
  const [isSaving, setIsSaving] = useState(false);
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
  const handleSubmit = async () => {
    if (!folder || validation || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await Promise.resolve(onSave(folder.id, name.trim()));
    } catch (error) {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="edit-folder-title"
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
            <DriveFileRenameOutlineIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Box flex={1}>
            <Typography id="edit-folder-title" variant="h6" fontWeight={700}>
              Edit folder
            </Typography>
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
              slotProps={{ htmlInput: { maxLength: FIELD_MAX } }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className="dialog-footer">
        <Button onClick={handleClose} className="dialog-btn-secondary">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={Boolean(validation) || !folder || isSaving}
          className="dialog-btn-primary"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
