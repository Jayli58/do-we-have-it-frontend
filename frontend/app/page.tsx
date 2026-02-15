"use client";

import {
  Box,
  Container,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect } from "react";

import ActionBar from "@/components/ActionBar/ActionBar";
import CreateFolderDialog from "@/components/ActionBar/CreateFolderDialog/CreateFolderDialog";
import CreateItemDialog from "@/components/ActionBar/CreateItemDialog/CreateItemDialog";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import EditFolderDialog from "@/components/FolderDialogs/EditFolderDialog/EditFolderDialog";
import FormTemplateManager from "@/components/FormTemplateManager/FormTemplateManager";
import ImportTemplateDialog from "@/components/FormTemplateManager/ImportTemplateDialog/ImportTemplateDialog";
import InventoryList from "@/components/InventoryList/InventoryList";
import EditItemDialog from "@/components/ItemDialogs/EditItemDialog";
import ViewItemDialog from "@/components/ItemDialogs/ViewItemDialog";
import SearchBar from "@/components/SearchBar/SearchBar";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { useInventoryPage } from "@/hooks/useInventoryPage";
import { useAuthStore } from "@/store/authStore";

export default function Home() {
  const { state, actions } = useInventoryPage();
  const initAuth = useAuthStore((store) => store.init);
  const user = useAuthStore((store) => store.user);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Box className="page-shell">
      <Container maxWidth="md" className="page-container">
        <Box className="page-header">
          <Typography variant="h4" className="page-title">
            Do we have it?
          </Typography>
          <Typography className="page-subtitle">
            Track folders, items, and custom attributes for everything you own.
          </Typography>
          {user?.name && (
            <Typography className="page-subtitle">Welcome, {user.name}.</Typography>
          )}
        </Box>

        <Box className="page-toolbar">
          <Box className="page-toolbar-breadcrumb">
            <Breadcrumb
              items={state.displayBreadcrumbs}
              onNavigate={actions.handleNavigate}
            />
          </Box>
          <IconButton
            aria-label="open search"
            onClick={() => actions.setSearchOpen(true)}
            className="page-toolbar-search"
            size="small"
          >
            <SearchIcon fontSize="small" />
          </IconButton>
        </Box>

        <InventoryList
          folders={state.query.trim() ? [] : state.folders}
          items={state.listItems}
          emptyMessage={
            state.query.trim()
              ? "No matches yet. Try a different keyword."
              : "Create folders and items to start your inventory."
          }
          onOpenFolder={(folder) => actions.handleFolderOpen(folder.id, folder.name)}
          onViewItem={(item) => actions.setViewItem(item)}
          onEditFolder={(folder) => actions.setEditFolderData(folder)}
          onEditItem={(item) => actions.setEditItemData(item)}
          onDeleteFolder={actions.handleDeleteFolderPrompt}
          onDeleteItem={actions.handleDeleteItemPrompt}
        />

        <ActionBar
          onCreateFolder={() => actions.setCreateFolderOpen(true)}
          onCreateItem={() => actions.setCreateItemOpen(true)}
          onManageTemplates={() => actions.setTemplateManagerOpen(true)}
        />
      </Container>

      <CreateFolderDialog
        open={state.isCreateFolderOpen}
        onClose={() => actions.setCreateFolderOpen(false)}
        onCreate={actions.handleCreateFolder}
        existingNames={state.folders.map((folder) => folder.name)}
        resetKey={state.createFolderResetKey}
      />

      <CreateItemDialog
        open={state.isCreateItemOpen}
        onClose={() => actions.setCreateItemOpen(false)}
        onCreate={actions.handleCreateItem}
        fields={state.selectedTemplate?.fields}
        templateName={state.selectedTemplate?.name ?? null}
        onOpenTemplateImport={() => actions.setImportTemplateOpen(true)}
        resetKey={state.createItemResetKey}
        existingNames={state.items.map((item) => item.name)}
      />

      <ViewItemDialog
        open={Boolean(state.viewItem)}
        item={state.viewItem}
        onClose={() => actions.setViewItem(null)}
      />

      <EditItemDialog
        open={Boolean(state.editItemData)}
        item={state.editItemData}
        onClose={() => actions.setEditItemData(null)}
        onSave={actions.handleCreateEditItem}
        fields={state.editItemFields}
        existingNames={state.items.map((item) => item.name)}
      />

      <EditFolderDialog
        open={Boolean(state.editFolderData)}
        folder={state.editFolderData}
        existingNames={state.folders.map((folder) => folder.name)}
        onClose={() => actions.setEditFolderData(null)}
        onSave={actions.handleEditFolder}
      />

      <DeleteConfirmDialog
        open={Boolean(state.deleteTarget)}
        onCancel={() => actions.setDeleteTarget(null)}
        onConfirm={actions.handleConfirmDelete}
        title={state.deleteDialogInfo?.title}
        description={state.deleteDialogInfo?.description}
      />

      <FormTemplateManager
        open={state.isTemplateManagerOpen}
        onClose={() => actions.setTemplateManagerOpen(false)}
      />

      <ImportTemplateDialog
        open={state.isImportTemplateOpen}
        templates={state.templates}
        onClose={() => actions.setImportTemplateOpen(false)}
        onSelect={actions.handleSelectTemplate}
      />

      <Dialog
        open={state.isSearchOpen}
        onClose={actions.handleSearchClose}
        fullWidth
        maxWidth="sm"
        aria-label="Search"
      >
        <DialogContent>
          <SearchBar
            value={state.query}
            onChange={actions.setQuery}
            onSearch={actions.handleSearchSubmit}
            autoFocus
            variant="plain"
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
