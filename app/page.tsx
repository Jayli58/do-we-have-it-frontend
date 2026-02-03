"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Container, Typography } from "@mui/material";

import ActionBar from "@/components/ActionBar/ActionBar";
import CreateFolderDialog from "@/components/ActionBar/CreateFolderDialog/CreateFolderDialog";
import CreateItemDialog from "@/components/ActionBar/CreateItemDialog/CreateItemDialog";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import EditFolderDialog from "@/components/FolderDialogs/EditFolderDialog/EditFolderDialog";
import InventoryList from "@/components/InventoryList/InventoryList";
import EditItemDialog from "@/components/ItemDialogs/EditItemDialog/EditItemDialog";
import ViewItemDialog from "@/components/ItemDialogs/ViewItemDialog/ViewItemDialog";
import SearchBar from "@/components/SearchBar/SearchBar";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { useInventoryStore } from "@/store/inventoryStore";
import { useSearchStore } from "@/store/searchStore";
import type { Folder, Item } from "@/types";

export default function Home() {
  const {
    currentFolderId,
    breadcrumbs,
    folders,
    items,
    loadContents,
    setBreadcrumbs,
    addFolder,
    addItem,
    renameFolder,
    editItem,
    removeFolder,
    removeItem,
  } = useInventoryStore();
  const { query, results, setQuery, runSearch, clear } = useSearchStore();
  const [isCreateFolderOpen, setCreateFolderOpen] = useState(false);
  const [isCreateItemOpen, setCreateItemOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Item | null>(null);
  const [editItemData, setEditItemData] = useState<Item | null>(null);
  const [editFolderData, setEditFolderData] = useState<Folder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "folder"; folder: Folder }
    | { type: "item"; item: Item }
    | null
  >(null);

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

  const handleCreateFolder = async (name: string) => {
    await addFolder(name);
    setCreateFolderOpen(false);
  };

  const handleCreateItem = async (data: {
    name: string;
    comments: string;
    attributes: Item["attributes"];
  }) => {
    await addItem({
      name: data.name,
      comments: data.comments,
      attributes: data.attributes,
      parentId: currentFolderId,
    });
    setCreateItemOpen(false);
  };

  const handleEditFolder = async (id: string, name: string) => {
    await renameFolder(id, name);
    setEditFolderData(null);
  };

  const handleEditItem = async (data: {
    id: string;
    name: string;
    comments: string;
    attributes: Item["attributes"];
  }) => {
    await editItem(data.id, {
      name: data.name,
      comments: data.comments,
      attributes: data.attributes,
    });
    setEditItemData(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    if (deleteTarget.type === "folder") {
      await removeFolder(deleteTarget.folder.id);
    } else {
      await removeItem(deleteTarget.item.id);
    }
    setDeleteTarget(null);
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
          onViewItem={(item) => setViewItem(item)}
          onEditFolder={(folder) => setEditFolderData(folder)}
          onEditItem={(item) => setEditItemData(item)}
          onDeleteFolder={(folder) =>
            setDeleteTarget({ type: "folder", folder })
          }
          onDeleteItem={(item) => setDeleteTarget({ type: "item", item })}
        />

        <ActionBar
          onCreateFolder={() => setCreateFolderOpen(true)}
          onCreateItem={() => setCreateItemOpen(true)}
        />
      </Container>

      <CreateFolderDialog
        open={isCreateFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        onCreate={handleCreateFolder}
        existingNames={folders.map((folder) => folder.name)}
      />

      <CreateItemDialog
        open={isCreateItemOpen}
        onClose={() => setCreateItemOpen(false)}
        onCreate={handleCreateItem}
      />

      <ViewItemDialog
        open={Boolean(viewItem)}
        item={viewItem}
        onClose={() => setViewItem(null)}
      />

      <EditItemDialog
        open={Boolean(editItemData)}
        item={editItemData}
        onClose={() => setEditItemData(null)}
        onSave={handleEditItem}
      />

      <EditFolderDialog
        open={Boolean(editFolderData)}
        folder={editFolderData}
        existingNames={folders.map((folder) => folder.name)}
        onClose={() => setEditFolderData(null)}
        onSave={handleEditFolder}
      />

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteTarget?.type === "folder" ? "folder" : "item"}`}
        description={
          deleteTarget?.type === "folder"
            ? `Delete "${deleteTarget.folder.name}" and its contents?`
            : deleteTarget?.item
              ? `Delete "${deleteTarget.item.name}"?`
              : "Are you sure you want to delete this?"
        }
      />
    </Box>
  );
}
