"use client";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
  Typography,
  Divider,
} from "@mui/material";

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
      <DialogTitle>Item details</DialogTitle>
      <DialogContent>
        {item ? (
          <Stack spacing={2} paddingTop={1}>
            <div>
              <Typography variant="subtitle2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {item.name}
              </Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="text.secondary">
                Comments
              </Typography>
              <Typography>{item.comments || "—"}</Typography>
            </div>
            {item.attributes.length > 0 && (
              <Stack spacing={1}>
                <Divider />
                <Typography variant="subtitle2" fontWeight={600}>
                  Attributes
                </Typography>
                {item.attributes.map((attribute) => (
                  <Stack key={attribute.fieldId} direction="row" spacing={1}>
                    <Typography fontWeight={600}>
                      {attribute.fieldName}:
                    </Typography>
                    <Typography color="text.secondary">
                      {attribute.value || "—"}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
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
