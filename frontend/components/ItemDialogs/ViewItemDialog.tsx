"use client";

import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useEffect, useState } from "react";

import ItemImageDialog from "@/components/ItemDialogs/ItemImageDialog/ItemImageDialog";
import type { Item } from "@/types";

interface ViewItemDialogProps {
  open: boolean;
  item: Item | null;
  onClose: () => void;
}

export default function ViewItemDialog({
  open,
  item,
  onClose,
}: ViewItemDialogProps) {
  const [displayItem, setDisplayItem] = useState<Item | null>(item);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  useEffect(() => {
    if (item) {
      setDisplayItem(item);
    }
  }, [item]);

  useEffect(() => {
    if (!open) {
      setImageDialogOpen(false);
    }
  }, [open]);

  const displayImageName = displayItem?.image?.name ?? null;

  const handleImageOpen = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    // if no displayItem or no image, return
    if (!displayImageName) {
      return;
    }
    setImageDialogOpen(true);
  };

  const handleImageClose = () => {
    setImageDialogOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="view-item-title"
      TransitionProps={{
        onExited: () => {
          setDisplayItem(null);
        },
      }}
    >
      <DialogContent>
        <Box
          display="flex"
          gap={2}
          alignItems="flex-start"
          className="dialog-flex-direction"
        >
          <Box className="dialog-icon-blue dialog-icon-align">
            <VisibilityIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Box flex={1}>
            <Typography id="view-item-title" variant="h6" fontWeight={700}>
              Item details
            </Typography>
            {displayItem ? (
              <Stack spacing={1} paddingTop={2}>
                <Stack direction="row" spacing={4}>
                  <Typography sx={{ minWidth: 110 }}>Item name:</Typography>
                  <Typography fontWeight={600}>{displayItem.name}</Typography>
                </Stack>
                {displayItem.attributes.length > 0 && (
                  <Stack spacing={1}>                
                    {displayItem.attributes.map((attribute) => (
                      <Stack key={attribute.fieldId} direction="row" spacing={4}>
                        <Typography sx={{ minWidth: 110 }}>
                          {attribute.fieldName}:
                        </Typography>
                        <Typography color="text.secondary">
                          {attribute.value || "—"}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}
                <Stack direction="row" spacing={4}>
                  <Typography sx={{ minWidth: 110 }}>Comments:</Typography>
                  <Typography color="text.secondary">
                    {displayItem.comments || "—"}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={4}>
                  <Typography sx={{ minWidth: 110 }}>Image:</Typography>
                  {displayImageName ? (
                    <a
                      className="dialog-text-link"
                      href="#"
                      onClick={handleImageOpen}
                    >
                      {displayImageName}
                    </a>
                  ) : (
                    <Typography color="text.secondary">—</Typography>
                  )}
                </Stack>
              </Stack>
            ) : (
              <Typography color="text.secondary">No item selected.</Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className="dialog-footer">
        <Button onClick={onClose} className="dialog-btn-secondary">
          Close
        </Button>
      </DialogActions>
      <ItemImageDialog
        open={imageDialogOpen}
        itemId={displayItem?.id}
        imageName={displayImageName}
        onClose={handleImageClose}
      />
    </Dialog>
  );
}
