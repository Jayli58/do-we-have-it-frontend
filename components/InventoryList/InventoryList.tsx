"use client";

import { Box, Stack, Typography } from "@mui/material";

import type { Folder, Item } from "@/types";
import FolderRow from "@/components/InventoryList/FolderRow/FolderRow";
import ItemRow from "@/components/InventoryList/ItemRow/ItemRow";

interface InventoryListProps {
  folders: Folder[];
  items: Item[];
  emptyMessage?: string;
  onOpenFolder?: (folder: Folder) => void;
  onViewItem?: (item: Item) => void;
  onEditFolder?: (folder: Folder) => void;
  onEditItem?: (item: Item) => void;
  onDeleteFolder?: (folder: Folder) => void;
  onDeleteItem?: (item: Item) => void;
}

export default function InventoryList({
  folders,
  items,
  emptyMessage,
  onOpenFolder,
  onViewItem,
  onEditFolder,
  onEditItem,
  onDeleteFolder,
  onDeleteItem,
}: InventoryListProps) {
  const sortedFolders = [...folders].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));
  const isEmpty = sortedFolders.length === 0 && sortedItems.length === 0;

  return (
    <Box className="mat-card" sx={{ padding: 2 }}>
      {isEmpty ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          paddingY={6}
          gap={1}
          textAlign="center"
        >
          <Typography variant="h6" fontWeight={700}>
            Nothing here yet
          </Typography>
          <Typography color="text.secondary">
            {emptyMessage ??
              "Create folders and items to start tracking your inventory."}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {sortedFolders.map((folder) => (
            <FolderRow
              key={folder.id}
              folder={folder}
              onOpen={onOpenFolder}
              onEdit={onEditFolder}
              onDelete={onDeleteFolder}
            />
          ))}
          {sortedItems.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onView={onViewItem}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
