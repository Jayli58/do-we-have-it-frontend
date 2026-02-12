"use client";

import { useEffect, useRef } from "react";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  variant?: "card" | "plain";
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder,
  autoFocus,
  variant = "card",
}: SearchBarProps) {
  const wrapperClassName = variant === "card" ? "mat-card mat-card-compact" : undefined;
  const wrapperSx = variant === "card" ? { padding: 0 } : undefined;
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <Box className={wrapperClassName} sx={wrapperSx}>
      <TextField
        fullWidth
        autoFocus={autoFocus}
        inputRef={inputRef}
        value={value}
        placeholder={placeholder ?? "Search items and folders..."}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSearch();
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={onSearch} aria-label="search">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
