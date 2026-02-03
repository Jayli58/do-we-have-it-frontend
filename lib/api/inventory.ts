import type { Folder, Item } from "@/types";

const folders: Folder[] = [];
const items: Item[] = [];

const createId = () =>
  `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const now = () => new Date().toISOString();

export const getFolderContents = async (parentId: string | null) => {
  return {
    folders: folders.filter((folder) => folder.parentId === parentId),
    items: items.filter((item) => item.parentId === parentId),
  };
};

export const createFolder = async (name: string, parentId: string | null) => {
  const timestamp = now();
  const folder: Folder = {
    id: createId(),
    name,
    parentId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  folders.push(folder);
  return folder;
};

export const updateFolder = async (id: string, name: string) => {
  const folder = folders.find((entry) => entry.id === id);
  if (!folder) {
    return null;
  }
  folder.name = name;
  folder.updatedAt = now();
  return folder;
};

export const deleteFolder = async (id: string) => {
  const index = folders.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return false;
  }
  folders.splice(index, 1);
  return true;
};

export const createItem = async (
  data: Omit<Item, "id" | "createdAt" | "updatedAt">,
  parentId: string | null,
) => {
  const timestamp = now();
  const item: Item = {
    ...data,
    parentId,
    id: createId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  items.push(item);
  return item;
};

export const getItem = async (id: string) => {
  return items.find((entry) => entry.id === id) ?? null;
};

export const updateItem = async (id: string, data: Partial<Item>) => {
  const item = items.find((entry) => entry.id === id);
  if (!item) {
    return null;
  }
  Object.assign(item, data, { updatedAt: now() });
  return item;
};

export const deleteItem = async (id: string) => {
  const index = items.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return false;
  }
  items.splice(index, 1);
  return true;
};

export const searchItems = async (query: string, parentId: string | null) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }
  return items.filter((item) => {
    if (item.parentId !== parentId) {
      return false;
    }
    const nameMatch = item.name.toLowerCase().includes(normalizedQuery);
    const commentMatch = item.comments
      .toLowerCase()
      .includes(normalizedQuery);
    const attributeMatch = item.attributes.some((attribute) => {
      return (
        attribute.fieldName.toLowerCase().includes(normalizedQuery) ||
        attribute.value.toLowerCase().includes(normalizedQuery)
      );
    });
    return nameMatch || commentMatch || attributeMatch;
  });
};
