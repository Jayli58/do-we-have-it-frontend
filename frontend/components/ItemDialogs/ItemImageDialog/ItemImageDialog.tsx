"use client";

import { Box, Button, Dialog, DialogActions, DialogContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { getItemImage } from "@/api/inventory";

interface ItemImageDialogProps {
  open: boolean;
  itemId: string | null | undefined;
  imageName: string | null | undefined;
  onClose: () => void;
}

export default function ItemImageDialog({
  open,
  itemId,
  imageName,
  onClose,
}: ItemImageDialogProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !itemId || !imageName) {
      return;
    }

    let active = true;
    const fetchImage = async () => {
      setIsLoading(true);
      setImageError("");
      try {
        const blob = await getItemImage(itemId);
        const objectUrl = URL.createObjectURL(blob);
        if (active) {
          setImageSrc(objectUrl);
        } else {
          URL.revokeObjectURL(objectUrl);
        }
      } catch (error) {
        if (active) {
          setImageError("Image preview is not available yet.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      active = false;
    };
  }, [imageName, itemId, open]);

  useEffect(() => {
    if (!open) {
      setImageError("");
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
      setImageSrc(null);
      setIsLoading(false);
    }
  }, [imageSrc, open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="view-item-image-title"
    >
      <DialogContent>
        <Stack spacing={2} alignItems="center">
          <Typography id="view-item-image-title" variant="h6" fontWeight={700}>
            {imageName ?? "Image"}
          </Typography>
          {isLoading ? (
            <Typography color="text.secondary">Loading image...</Typography>
          ) : imageSrc ? (
            <Box
              component="img"
              src={imageSrc}
              alt={imageName ?? "Item image"}
              className="item-image-preview"
            />
          ) : (
            <Typography color="text.secondary">
              {imageError || "Image preview is not available yet."}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions className="dialog-footer">
        <Button onClick={onClose} className="dialog-btn-secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
