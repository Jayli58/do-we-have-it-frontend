import type { Folder, Item } from "@/types";

import { apiFetch, parseErrorMessage, parseJson } from "@/api/client";

export const getFolderContents = async (parentId: string | null) => {
  const response = await apiFetch("/folders", {
    query: { parentId: parentId ?? undefined },
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return parseJson<{ folders: Folder[]; items: Item[] }>(response);
};

export const createFolder = async (name: string, parentId: string | null) => {
  const response = await apiFetch("/folders", {
    method: "POST",
    body: { name, parentId },
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return parseJson<Folder>(response);
};

export const updateFolder = async (folder: Folder) => {
  const response = await apiFetch(`/folders/${folder.id}`, {
    method: "PUT",
    body: {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    },
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return parseJson<Folder>(response);
};

export const deleteFolder = async (id: string) => {
  const response = await apiFetch(`/folders/${id}`, { method: "DELETE" });
  if (response.status === 404) {
    return false;
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return true;
};

export const createItem = async (
  data: Omit<Item, "id" | "createdAt" | "updatedAt">,
  parentId: string | null,
) => {
  const response = await apiFetch("/items", {
    method: "POST",
    body: {
      name: data.name,
      comments: data.comments ?? "",
      parentId,
      attributes: data.attributes,
    },
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return parseJson<Item>(response);
};

export const getItem = async (id: string) => {
  const response = await apiFetch(`/items/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return parseJson<Item>(response);
};

export const updateItem = async (item: Item) => {
  const response = await apiFetch(`/items/${item.id}`, {
    method: "PUT",
    body: {
      id: item.id,
      name: item.name,
      comments: item.comments ?? "",
      parentId: item.parentId,
      attributes: item.attributes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    },
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return parseJson<Item>(response);
};

export const deleteItem = async (id: string, parentId: string | null) => {
  const response = await apiFetch(`/items/${id}`, {
    method: "DELETE",
    query: { parentId: parentId ?? undefined },
  });
  if (response.status === 404) {
    return false;
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return true;
};

export const searchItems = async (query: string, parentId: string | null) => {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }
  const response = await apiFetch("/items/search", {
    query: { query: trimmed, parentId: parentId ?? undefined },
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  const data = await parseJson<{ items: Item[] }>(response);
  return data.items ?? [];
};
