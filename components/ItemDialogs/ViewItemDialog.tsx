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
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="view-item-title"
    >
      <DialogContent>
        <Box
          display="flex"
          gap={2}
          alignItems="flex-start"
          flexDirection={{ xs: "column", sm: "row" }}
        >
          <Box className="dialog-icon-blue" sx={{ alignSelf: { xs: "center", sm: "flex-start" } }}>
            <VisibilityIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Box flex={1}>
            <Typography id="view-item-title" variant="h6" fontWeight={700}>
              Item details
            </Typography>
            {item ? (
              <Stack spacing={1} paddingTop={2}>
                <Stack direction="row" spacing={4}>
                  <Typography sx={{ minWidth: 110 }}>Item name:</Typography>
                  <Typography fontWeight={600}>{item.name}</Typography>
                </Stack>
                {item.attributes.length > 0 && (
                  <Stack spacing={1}>                
                    {item.attributes.map((attribute) => (
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
                    {item.comments || "—"}
                  </Typography>
                </Stack>
              </Stack>
            ) : (
              <Typography color="text.secondary">No item selected.</Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
