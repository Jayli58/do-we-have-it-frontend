"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface DeleteConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [displayTitle, setDisplayTitle] = useState<string | undefined>(title);
  const [displayDescription, setDisplayDescription] = useState<string | undefined>(description);
  const [displayConfirmLabel, setDisplayConfirmLabel] = useState<string | undefined>(confirmLabel);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open && title !== undefined) {
      setDisplayTitle(title);
    }
  }, [open, title]);

  useEffect(() => {
    if (open && description !== undefined) {
      setDisplayDescription(description);
    }
  }, [description, open]);

  useEffect(() => {
    if (open && confirmLabel !== undefined) {
      setDisplayConfirmLabel(confirmLabel);
    }
  }, [confirmLabel, open]);

  const handleConfirm = async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    try {
      await Promise.resolve(onConfirm());
    } catch (error) {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      fullWidth
      maxWidth="xs"
      aria-labelledby="delete-confirm-title"
      TransitionProps={{
        onExited: () => {
          setDisplayTitle(undefined);
          setDisplayDescription(undefined);
          setDisplayConfirmLabel(undefined);
          setIsProcessing(false);
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
            className="dialog-icon"
            sx={{ alignSelf: { xs: "center", sm: "flex-start" } }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
              className="size-6 text-red-600"
            >
              <path
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
          <Box flex={1}>
            <Typography id="delete-confirm-title" variant="h6" fontWeight={700}>
              {displayTitle ?? "Delete"}
            </Typography>
            <Stack paddingTop={2} />
            <Typography color="text.secondary">
              {displayDescription ?? "Are you sure you want to delete this?"}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={isProcessing}
        >
          {isProcessing ? "Deleting..." : displayConfirmLabel ?? "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
