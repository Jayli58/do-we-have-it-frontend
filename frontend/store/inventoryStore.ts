import { create } from "zustand";

import type { BreadcrumbItem, Folder, Item } from "@/types";
import {
  createFolder,
  createItem,
  deleteFolder,
  deleteItem,
  getFolderContents,
  updateFolder,
  updateItem,
} from "@/api/inventory";

interface InventoryState {
  currentFolderId: string | null;
  breadcrumbs: BreadcrumbItem[];
  folders: Folder[];
  items: Item[];
  isLoading: boolean;
  loadContents: (parentId: string | null) => Promise<void>;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addFolder: (name: string) => Promise<Folder | null>;
  renameFolder: (id: string, name: string) => Promise<Folder | null>;
  removeFolder: (id: string) => Promise<boolean>;
  addItem: (data: Omit<Item, "id" | "createdAt" | "updatedAt">) => Promise<Item | null>;
  editItem: (id: string, data: Partial<Item>) => Promise<Item | null>;
  removeItem: (id: string) => Promise<boolean>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  currentFolderId: null,
  breadcrumbs: [{ id: null, name: "Home" }],
  folders: [],
  items: [],
  isLoading: false,
  loadContents: async (parentId) => {
    set({ isLoading: true });
    const { folders, items } = await getFolderContents(parentId);
    set({ currentFolderId: parentId, folders, items, isLoading: false });
  },
  setBreadcrumbs: (breadcrumbs) => {
    set({ breadcrumbs });
  },
  addFolder: async (name) => {
    const { currentFolderId, loadContents } = get();
    const folder = await createFolder(name, currentFolderId);
    await loadContents(currentFolderId);
    return folder;
  },
  renameFolder: async (id, name) => {
    const { currentFolderId, folders, loadContents } = get();
    const existing = folders.find((entry) => entry.id === id);
    if (!existing) {
      return null;
    }
    const folder = await updateFolder({ ...existing, name });
    await loadContents(currentFolderId);
    return folder;
  },
  removeFolder: async (id) => {
    const { currentFolderId, loadContents } = get();
    const deleted = await deleteFolder(id);
    await loadContents(currentFolderId);
    return deleted;
  },
  addItem: async (data) => {
    const { currentFolderId, loadContents } = get();
    const item = await createItem(data, currentFolderId);
    await loadContents(currentFolderId);
    return item;
  },
  editItem: async (id, data) => {
    const { currentFolderId, items, loadContents } = get();
    const existing = items.find((entry) => entry.id === id);
    if (!existing) {
      return null;
    }
    const item = await updateItem({ ...existing, ...data });
    await loadContents(currentFolderId);
    return item;
  },
  removeItem: async (id) => {
    const { currentFolderId, items, loadContents } = get();
    const existing = items.find((entry) => entry.id === id);
    const deleted = await deleteItem(id, existing?.parentId ?? currentFolderId);
    await loadContents(currentFolderId);
    return deleted;
  },
}));
