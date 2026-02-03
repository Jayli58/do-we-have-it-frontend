"use client";

import { useEffect, useMemo } from "react";
import { Box, Container, Typography } from "@mui/material";

import ActionBar from "@/components/ActionBar/ActionBar";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import InventoryList from "@/components/InventoryList/InventoryList";
import SearchBar from "@/components/SearchBar/SearchBar";
import { useInventoryStore } from "@/store/inventoryStore";
import { useSearchStore } from "@/store/searchStore";

export default function Home() {
  const {
    currentFolderId,
    breadcrumbs,
    folders,
    items,
    loadContents,
    setBreadcrumbs,
  } = useInventoryStore();
  const { query, results, setQuery, runSearch, clear } = useSearchStore();

  useEffect(() => {
    void loadContents(null);
  }, [loadContents]);

  const listItems = useMemo(() => {
    if (query.trim()) {
      return results;
    }
    return items;
  }, [items, query, results]);

  const handleFolderOpen = async (folderId: string, name: string) => {
    const nextBreadcrumbs = [...breadcrumbs, { id: folderId, name }];
    setBreadcrumbs(nextBreadcrumbs);
    clear();
    await loadContents(folderId);
  };

  const handleNavigate = async (id: string | null) => {
    const index = breadcrumbs.findIndex((crumb) => crumb.id === id);
    const nextBreadcrumbs =
      index >= 0 ? breadcrumbs.slice(0, index + 1) : breadcrumbs;
    setBreadcrumbs(nextBreadcrumbs);
    clear();
    await loadContents(id);
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      clear();
      return;
    }
    await runSearch(query, currentFolderId);
  };

  return (
    <Box className="min-h-screen px-4 pb-16 pt-10">
      <Container maxWidth="md" className="flex flex-col gap-6">
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="h4" fontWeight={700}>
            Do we have it?
          </Typography>
          <Typography color="text.secondary">
            Track folders, items, and custom attributes for everything you own.
          </Typography>
        </Box>

        <Breadcrumb items={breadcrumbs} onNavigate={handleNavigate} />
        <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} />

        <InventoryList
          folders={query.trim() ? [] : folders}
          items={listItems}
          emptyMessage={
            query.trim()
              ? "No matches yet. Try a different keyword."
              : "Create folders and items to start your inventory."
          }
          onOpenFolder={(folder) => handleFolderOpen(folder.id, folder.name)}
        />

        <ActionBar />
      </Container>
    </Box>
  );
}
