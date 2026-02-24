import type { Item } from "@/types";

export type ItemFormPayload = Omit<Item, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  imageName?: string | null;
  imageFile?: File | null;
  imageRemoved?: boolean;
};

export const buildItemFormData = (data: ItemFormPayload) => {
  const formData = new FormData();
  const appendValue = (
    key: string,
    value: string | number | boolean | null | undefined,
  ) => {
    if (value === undefined) {
      return;
    }
    formData.append(key, value === null ? "" : String(value));
  };

  appendValue("id", data.id);
  appendValue("name", data.name);
  appendValue("comments", data.comments ?? "");
  appendValue("parentId", data.parentId ?? "");
  appendValue("createdAt", data.createdAt);
  appendValue("updatedAt", data.updatedAt);
  formData.append("attributes", JSON.stringify(data.attributes ?? []));

  if (data.imageFile) {
    formData.append("image", data.imageFile);
  }
  if (data.imageRemoved) {
    formData.append("imageRemoved", "true");
  }
  if (data.imageName) {
    formData.append("imageName", data.imageName);
  }

  return formData;
};
