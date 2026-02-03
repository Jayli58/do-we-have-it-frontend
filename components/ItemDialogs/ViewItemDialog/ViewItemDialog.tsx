"use client";

import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
  Typography,
  Divider,
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Box className="dialog-icon-blue" sx={{ marginTop: 0.5 }}>
            <VisibilityIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Item details
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {item ? (
          <Stack spacing={2} paddingTop={1}>
            <div>
              <Typography variant="h6" fontWeight={700}>
                {item.name}
              </Typography>
            </div>
            {item.attributes.length > 0 && (
              <Stack spacing={1}>
                <Divider />
                {item.attributes.map((attribute) => (
                  <Stack key={attribute.fieldId} direction="row" spacing={1}>
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
            <Stack direction="row" spacing={1}>
              <Typography sx={{ minWidth: 110 }}>Comments:</Typography>
              <Typography color="text.secondary">
                {item.comments || "—"}
              </Typography>
            </Stack>
          </Stack>
        ) : (
          <Typography color="text.secondary">No item selected.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
