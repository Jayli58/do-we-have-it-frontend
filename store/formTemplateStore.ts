import { create } from "zustand";

import type { FormTemplate } from "@/types";
import {
  createTemplate,
  deleteTemplate,
  getTemplates,
  importTemplate,
  updateTemplate,
} from "@/api/formTemplates";
import { DEFAULT_TEMPLATE_ID } from "@/api/formTemplates";

const defaultTemplate: FormTemplate = {
  id: DEFAULT_TEMPLATE_ID,
  name: "Default template",
  fields: [],
  createdAt: "1970-01-01T00:00:00.000Z",
};

const ensureDefaultTemplate = (templates: FormTemplate[]) => {
  if (templates.some((template) => template.id === DEFAULT_TEMPLATE_ID)) {
    return templates;
  }
  return [defaultTemplate, ...templates];
};

interface FormTemplateState {
  templates: FormTemplate[];
  selectedTemplateId: string | null;
  isLoading: boolean;
  loadTemplates: () => Promise<void>;
  addTemplate: (
    data: Omit<FormTemplate, "id" | "createdAt">,
  ) => Promise<FormTemplate | null>;
  editTemplate: (
    id: string,
    data: Omit<FormTemplate, "id" | "createdAt">,
  ) => Promise<FormTemplate | null>;
  removeTemplate: (id: string) => Promise<boolean>;
  selectTemplate: (id: string | null) => void;
  getSelectedTemplate: () => Promise<FormTemplate | null>;
}

export const useFormTemplateStore = create<FormTemplateState>((set, get) => ({
  templates: [],
  selectedTemplateId: null,
  isLoading: false,
  loadTemplates: async () => {
    set({ isLoading: true });
    const templates = await getTemplates();
    set({ templates: ensureDefaultTemplate(templates), isLoading: false });
  },
  addTemplate: async (data) => {
    const template = await createTemplate(data);
    set((state) => ({ templates: [...state.templates, template] }));
    return template;
  },
  editTemplate: async (id, data) => {
    const { templates } = get();
    const existing = templates.find((entry) => entry.id === id);
    if (!existing) {
      return null;
    }
    const template = await updateTemplate({ ...existing, ...data });
    if (template) {
      set((state) => ({
        templates: state.templates.map((entry) =>
          entry.id === template.id ? template : entry,
        ),
      }));
    }
    return template;
  },
  removeTemplate: async (id) => {
    const deleted = await deleteTemplate(id);
    if (deleted) {
      set((state) => ({
        templates: state.templates.filter((template) => template.id !== id),
      }));
    }
    return deleted;
  },
  selectTemplate: (id) => {
    set({ selectedTemplateId: id });
  },
  getSelectedTemplate: async () => {
    const { selectedTemplateId } = get();
    if (!selectedTemplateId) {
      return null;
    }
    return importTemplate(selectedTemplateId);
  },
}));
