"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import type { ChangeEvent } from "react";

interface ImageUploadFieldProps {
  imageName: string | null;
  imageError: string;
  onFileChange: (payload: {
    file: File | null;
    name: string | null;
    error: string;
  }) => void;
  onRemove: () => void;
}

const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/bmp",
  "image/tiff",
];
const IMAGE_HELPER_TEXT = "Optional · 10 MB max · JPG/JPEG, PNG, WebP, HEIC, GIF";
const IMAGE_TYPE_ERROR_TEXT =
  "Image must be a JPG/JPEG, PNG, WebP, HEIC, or GIF file.";
const IMAGE_SIZE_ERROR_TEXT = "Image must be 10 MB or smaller.";

export default function ImageUploadField({
  imageName,
  imageError,
  onFileChange,
  onRemove,
}: ImageUploadFieldProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!IMAGE_TYPES.includes(file.type)) {
      onFileChange({ file: null, name: null, error: IMAGE_TYPE_ERROR_TEXT });
      event.target.value = "";
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      onFileChange({ file: null, name: null, error: IMAGE_SIZE_ERROR_TEXT });
      event.target.value = "";
      return;
    }
    onFileChange({ file, name: file.name, error: "" });
  };

  return (
    <Stack spacing={0.5}>
      <Typography variant="body2" fontWeight={600}>
        Image
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button variant="outlined" component="label">
          {imageName ? "Replace image" : "Upload image"}
          <input
            hidden
            type="file"
            aria-label="Item image"
            accept={IMAGE_TYPES.join(",")}
            onChange={handleFileChange}
          />
        </Button>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <Typography variant="body2" color="text.secondary">
            {imageName ?? "No image selected"}
          </Typography>
          {imageName && (
            <Button size="small" onClick={onRemove}>
              Remove
            </Button>
          )}
        </Box>
      </Stack>
      <Typography
        variant="caption"
        color={imageError ? "error" : "text.secondary"}
      >
        {imageError || IMAGE_HELPER_TEXT}
      </Typography>
    </Stack>
  );
}
