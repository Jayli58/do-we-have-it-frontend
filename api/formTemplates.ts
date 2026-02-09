import type { FormTemplate } from "@/types";

const seedTimestamp = new Date().toISOString();

export const DEFAULT_TEMPLATE_ID = "tmpl-default";

const templates: FormTemplate[] = [
  {
    id: DEFAULT_TEMPLATE_ID,
    name: "Default",
    createdAt: seedTimestamp,
    fields: [],
  },
  {
    id: "tmpl-appliance",
    name: "Appliance Details",
    createdAt: seedTimestamp,
    fields: [
      {
        id: "field-model",
        name: "Model",
        type: "text",
        required: true,
      },
      {
        id: "field-serial",
        name: "Serial Number",
        type: "text",
        required: false,
      },
    ],
  },
  {
    id: "tmpl-tool",
    name: "Tool Specs",
    createdAt: seedTimestamp,
    fields: [
      {
        id: "field-brand",
        name: "Brand",
        type: "text",
        required: true,
      },
      {
        id: "field-voltage",
        name: "Voltage",
        type: "text",
        required: false,
      },
    ],
  },
];

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
  if (id === DEFAULT_TEMPLATE_ID) {
    return false;
  }
  const index = templates.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return false;
  }
  templates.splice(index, 1);
  return true;
};

export const updateTemplate = async (
  id: string,
  data: Omit<FormTemplate, "id" | "createdAt">,
) => {
  const template = templates.find((entry) => entry.id === id);
  if (!template) {
    return null;
  }
  template.name = data.name;
  template.fields = data.fields;
  return template;
};

export const importTemplate = async (id: string) => {
  return templates.find((entry) => entry.id === id) ?? null;
};
