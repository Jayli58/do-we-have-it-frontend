export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItemAttribute {
  fieldId: string;
  fieldName: string;
  value: string;
}

export interface Item {
  id: string;
  name: string;
  comments: string;
  parentId: string | null;
  attributes: ItemAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface FormField {
  id: string;
  name: string;
  type: "text";
  required: boolean;
}

export interface FormTemplate {
  id: string;
  name: string;
  fields: FormField[];
  createdAt: string;
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}
