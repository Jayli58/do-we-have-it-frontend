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
import { useInventoryPage } from "@/hooks/useInventoryPage";

export default function Home() {
  const { state, actions } = useInventoryPage();

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

        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          <Box flex={1} minWidth={0}>
            <Breadcrumb items={state.breadcrumbs} onNavigate={actions.handleNavigate} />
          </Box>
          <IconButton aria-label="open search" onClick={() => actions.setSearchOpen(true)}>
            <SearchIcon />
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
        onClose={() => actions.setSearchOpen(false)}
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
