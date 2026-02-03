import type { FormTemplate } from "@/types";

const templates: FormTemplate[] = [];

const createId = () =>
  `tmpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const now = () => new Date().toISOString();

export const getTemplates = async () => {
  return [...templates];
};

export const createTemplate = async (
  data: Omit<FormTemplate, "id" | "createdAt">,
) => {
  const template: FormTemplate = {
    ...data,
    id: createId(),
    createdAt: now(),
  };
  templates.push(template);
  return template;
};

export const deleteTemplate = async (id: string) => {
  const index = templates.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return false;
  }
  templates.splice(index, 1);
  return true;
};

export const importTemplate = async (id: string) => {
  return templates.find((entry) => entry.id === id) ?? null;
};
