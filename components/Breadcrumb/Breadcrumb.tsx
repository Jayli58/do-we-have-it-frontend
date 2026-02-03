"use client";

import { Box, Breadcrumbs, Chip } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { styled } from "@mui/material/styles";

import type { BreadcrumbItem } from "@/types";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (id: string | null) => void;
}

const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  height: theme.spacing(3.5),
  borderRadius: theme.spacing(1.5),
  fontWeight: 600,
  border: `1px solid ${theme.palette.divider}`,
  paddingInline: theme.spacing(1),
  "& .MuiChip-label": {
    paddingInline: theme.spacing(0.5),
  },
}));

export default function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <Box sx={{ paddingX: 0, paddingY: 0 }}>
      <Breadcrumbs separator=">" aria-label="breadcrumb">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <StyledBreadcrumb
              key={`${item.id ?? "root"}-${item.name}`}
              component={onNavigate && !isLast ? "a" : "div"}
              label={item.name}
              icon={index === 0 ? <HomeIcon fontSize="small" /> : undefined}
              clickable={Boolean(onNavigate && !isLast)}
              onClick={
                onNavigate && !isLast
                  ? (event) => {
                      event.preventDefault();
                      onNavigate(item.id);
                    }
                  : undefined
              }
            />
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
