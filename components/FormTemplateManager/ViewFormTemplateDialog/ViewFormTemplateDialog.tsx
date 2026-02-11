"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useEffect, useState } from "react";

import type { FormTemplate } from "@/types";

interface ViewFormTemplateDialogProps {
  open: boolean;
  template: FormTemplate | null;
  onClose: () => void;
}

export default function ViewFormTemplateDialog({
  open,
  template,
  onClose,
}: ViewFormTemplateDialogProps) {
  const [displayTemplate, setDisplayTemplate] = useState<FormTemplate | null>(template);

  useEffect(() => {
    if (template) {
      setDisplayTemplate(template);
    }
  }, [template]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="view-template-title"
      TransitionProps={{
        onExited: () => {
          setDisplayTemplate(null);
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
            <VisibilityIcon sx={{ color: "#2563eb" }} />
          </Box>
          <Box flex={1}>
            <Typography id="view-template-title" variant="h6" fontWeight={700}>
              Template details
            </Typography>
            {displayTemplate ? (
              <>
                <Stack paddingTop={2} />
                <List dense>
                  <Typography fontWeight={600}>
                    {displayTemplate.name}
                  </Typography>
                  <ListItem disableGutters>
                    <ListItemText primary="Item name" secondary="Required" />
                  </ListItem>
                  {displayTemplate.fields.map((field) => (
                    <ListItem key={field.id} disableGutters>
                      <ListItemText
                        primary={field.name}
                        secondary={field.required ? "Required" : "Optional"}
                      />
                    </ListItem>
                  ))}
                  <ListItem disableGutters>
                    <ListItemText primary="Comments" secondary="Optional" />
                  </ListItem>
                </List>
              </>
            ) : (
              <Typography color="text.secondary">
                No template selected.
              </Typography>
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
