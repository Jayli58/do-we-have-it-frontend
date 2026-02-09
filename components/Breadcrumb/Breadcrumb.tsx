"use client";

import { MouseEvent } from "react";
import { Box, Breadcrumbs, Chip } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

import type { BreadcrumbItem } from "@/types";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (id: string | null) => void;
}

export default function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <Box sx={{ paddingX: 0, paddingY: 0 }}>
      <Breadcrumbs
        separator=">"
        aria-label="breadcrumb"
        sx={{
          "& .MuiBreadcrumbs-ol": {
            flexWrap: "wrap",
            rowGap: 1,
          },
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Chip
              key={`${item.id ?? "root"}-${item.name}`}
              className="breadcrumb-chip"
              component={onNavigate && !isLast ? "a" : "div"}
              label={item.name}
              icon={index === 0 ? <HomeIcon fontSize="small" /> : undefined}
              clickable={Boolean(onNavigate && !isLast)}
              onClick={
                onNavigate && !isLast
                  ? (event: MouseEvent) => {
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
