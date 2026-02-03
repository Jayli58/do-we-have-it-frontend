"use client";

import { Box, Breadcrumbs, Link, Typography } from "@mui/material";

import type { BreadcrumbItem } from "@/types";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (id: string | null) => void;
}

export default function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <Box className="mat-card" sx={{ padding: 2 }}>
      <Breadcrumbs separator=">" aria-label="breadcrumb">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          if (isLast || !onNavigate) {
            return (
              <Typography
                key={`${item.id ?? "root"}-${item.name}`}
                color="text.primary"
                fontWeight={600}
              >
                {item.name}
              </Typography>
            );
          }
          return (
            <Link
              key={`${item.id ?? "root"}-${item.name}`}
              underline="hover"
              color="inherit"
              href="#"
              onClick={(event) => {
                event.preventDefault();
                onNavigate(item.id);
              }}
              sx={{ fontWeight: 600 }}
            >
              {item.name}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
