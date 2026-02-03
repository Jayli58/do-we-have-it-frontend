"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Container, Typography } from "@mui/material";

import ActionBar from "@/components/ActionBar/ActionBar";
import CreateFolderDialog from "@/components/ActionBar/CreateFolderDialog/CreateFolderDialog";
import CreateItemDialog from "@/components/ActionBar/CreateItemDialog/CreateItemDialog";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import EditFolderDialog from "@/components/FolderDialogs/EditFolderDialog/EditFolderDialog";
import FormTemplateManager from "@/components/FormTemplateManager/FormTemplateManager";
import ImportTemplateDialog from "@/components/FormTemplateManager/ImportTemplateDialog/ImportTemplateDialog";
import InventoryList from "@/components/InventoryList/InventoryList";
import EditItemDialog from "@/components/ItemDialogs/EditItemDialog/EditItemDialog";
import ViewItemDialog from "@/components/ItemDialogs/ViewItemDialog/ViewItemDialog";
import SearchBar from "@/components/SearchBar/SearchBar";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { useFormTemplateStore } from "@/store/formTemplateStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { useSearchStore } from "@/store/searchStore";
import type { Folder, FormTemplate, Item } from "@/types";

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
  const {
    templates,
    loadTemplates,
    selectTemplate,
    getSelectedTemplate,
  } = useFormTemplateStore();
  const [isCreateFolderOpen, setCreateFolderOpen] = useState(false);
  const [isCreateItemOpen, setCreateItemOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Item | null>(null);
  const [editItemData, setEditItemData] = useState<Item | null>(null);
  const [editFolderData, setEditFolderData] = useState<Folder | null>(null);
  const [isTemplateManagerOpen, setTemplateManagerOpen] = useState(false);
  const [isImportTemplateOpen, setImportTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<FormTemplate | null>(null);
  const [createFolderResetKey, setCreateFolderResetKey] = useState(0);
  const [createItemResetKey, setCreateItemResetKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "folder"; folder: Folder }
    | { type: "item"; item: Item }
    | null
  >(null);
  const [deleteDialogInfo, setDeleteDialogInfo] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    void loadContents(null);
  }, [loadContents]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

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
    setCreateFolderResetKey((prev) => prev + 1);
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
    setCreateItemResetKey((prev) => prev + 1);
    setSelectedTemplate(null);
    selectTemplate(null);
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
    setDeleteDialogInfo(null);
  };

  const handleSelectTemplate = async (template: FormTemplate) => {
    selectTemplate(template.id);
    const loaded = await getSelectedTemplate();
    setSelectedTemplate(loaded ?? template);
    setImportTemplateOpen(false);
  };

  return (
    <Box className="min-h-screen px-3 pb-16 pt-6 sm:px-4 sm:pt-10">
      <Container maxWidth="md" className="flex flex-col gap-4">
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
          onDeleteFolder={(folder) => {
            setDeleteTarget({ type: "folder", folder });
            setDeleteDialogInfo({
              title: "Delete folder",
              description: `Delete "${folder.name}" and its contents?`,
            });
          }}
          onDeleteItem={(item) => {
            setDeleteTarget({ type: "item", item });
            setDeleteDialogInfo({
              title: "Delete item",
              description: `Delete "${item.name}"?`,
            });
          }}
        />

        <ActionBar
          onCreateFolder={() => setCreateFolderOpen(true)}
          onCreateItem={() => setCreateItemOpen(true)}
          onManageTemplates={() => setTemplateManagerOpen(true)}
        />
      </Container>

      <CreateFolderDialog
        open={isCreateFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        onCreate={handleCreateFolder}
        existingNames={folders.map((folder) => folder.name)}
        resetKey={createFolderResetKey}
      />

      <CreateItemDialog
        open={isCreateItemOpen}
        onClose={() => setCreateItemOpen(false)}
        onCreate={handleCreateItem}
        fields={selectedTemplate?.fields}
        templateName={selectedTemplate?.name ?? null}
        onOpenTemplateImport={() => setImportTemplateOpen(true)}
        resetKey={createItemResetKey}
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
        title={deleteDialogInfo?.title}
        description={deleteDialogInfo?.description}
      />

      <FormTemplateManager
        open={isTemplateManagerOpen}
        onClose={() => setTemplateManagerOpen(false)}
      />

      <ImportTemplateDialog
        open={isImportTemplateOpen}
        templates={templates}
        onClose={() => setImportTemplateOpen(false)}
        onSelect={handleSelectTemplate}
      />
    </Box>
  );
}
