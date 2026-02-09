
import { useEffect, useMemo, useState } from "react";
import { useFormTemplateStore } from "@/store/formTemplateStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { useSearchStore } from "@/store/searchStore";
import type { Folder, FormTemplate, Item } from "@/types";

export function useInventoryPage() {
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

    // State management for dialogs
    const [isCreateFolderOpen, setCreateFolderOpen] = useState(false);
    const [isCreateItemOpen, setCreateItemOpen] = useState(false);
    const [viewItem, setViewItem] = useState<Item | null>(null);
    const [editItemData, setEditItemData] = useState<Item | null>(null);
    const [editFolderData, setEditFolderData] = useState<Folder | null>(null);
    const [isTemplateManagerOpen, setTemplateManagerOpen] = useState(false);
    const [isImportTemplateOpen, setImportTemplateOpen] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);

    // State for forms and operations
    const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
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

    // Effects for loading initial data
    useEffect(() => {
        void loadContents(null);
    }, [loadContents]);

    useEffect(() => {
        void loadTemplates();
    }, [loadTemplates]);

    // Computed values
    const listItems = useMemo(() => {
        if (query.trim()) {
            return results;
        }
        return items;
    }, [items, query, results]);

    const requiredTemplateFields = useMemo(() => {
        const map = new Map<string, boolean>();
        templates.forEach((template) => {
            template.fields.forEach((field) => {
                if (field.required) {
                    map.set(field.name.toLowerCase(), true);
                }
            });
        });
        return map;
    }, [templates]);

    const editItemFields = useMemo(() => {
        if (!editItemData) return [];

        return editItemData.attributes.map((attribute) => ({
            id: attribute.fieldId,
            name: attribute.fieldName,
            type: "text" as const,
            required: requiredTemplateFields.get(attribute.fieldName.toLowerCase()) ?? false,
        }));
    }, [editItemData, requiredTemplateFields]);

    // Event Handlers
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

    const handleSearchSubmit = async () => {
        await handleSearch();
        setSearchOpen(false);
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

    const handleCreateEditItem = async (data: {
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

    const handleDeleteFolderPrompt = (folder: Folder) => {
        setDeleteTarget({ type: "folder", folder });
        setDeleteDialogInfo({
            title: "Delete folder",
            description: `Delete "${folder.name}" and its contents?`,
        });
    };

    const handleDeleteItemPrompt = (item: Item) => {
        setDeleteTarget({ type: "item", item });
        setDeleteDialogInfo({
            title: "Delete item",
            description: `Delete "${item.name}"?`,
        });
    };

    // Return all necessary state and handlers
    return {
        state: {
            breadcrumbs,
            folders,
            listItems,
            query,
            isCreateFolderOpen,
            isCreateItemOpen,
            viewItem,
            editItemData,
            editFolderData,
            isTemplateManagerOpen,
            isImportTemplateOpen,
            isSearchOpen,
            selectedTemplate,
            createFolderResetKey,
            createItemResetKey,
            deleteTarget,
            deleteDialogInfo,
            templates,
            editItemFields,
        },
        actions: {
            setQuery,
            setCreateFolderOpen,
            setCreateItemOpen,
            setViewItem,
            setEditItemData,
            setEditFolderData,
            setTemplateManagerOpen,
            setImportTemplateOpen,
            setSearchOpen,
            handleNavigate,
            handleFolderOpen,
            handleSearchSubmit,
            handleCreateFolder,
            handleCreateItem,
            handleEditFolder,
            handleCreateEditItem, // renamed to prevent conflict with internal editItem fn from store but clarifies intent
            handleConfirmDelete,
            handleSelectTemplate,
            handleDeleteFolderPrompt,
            handleDeleteItemPrompt,
            setDeleteTarget,
        }
    };
}
