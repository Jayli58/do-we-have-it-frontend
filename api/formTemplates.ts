import type { FormTemplate } from "@/types";

import { apiFetch, parseErrorMessage, parseJson } from "@/api/client";

export const DEFAULT_TEMPLATE_ID = "tmpl-default";

export const getTemplates = async () => {
  const response = await apiFetch("/templates");
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return parseJson<FormTemplate[]>(response);
};

export const createTemplate = async (
  data: Omit<FormTemplate, "id" | "createdAt">,
) => {
  const response = await apiFetch("/templates", {
    method: "POST",
    body: {
      name: data.name,
      fields: data.fields,
    },
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return parseJson<FormTemplate>(response);
};

export const deleteTemplate = async (id: string) => {
  if (id === DEFAULT_TEMPLATE_ID) {
    return false;
  }
  const response = await apiFetch(`/templates/${id}`, { method: "DELETE" });
  if (response.status === 404) {
    return false;
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return true;
};

export const updateTemplate = async (template: FormTemplate) => {
  const response = await apiFetch(`/templates/${template.id}`, {
    method: "PUT",
    body: {
      id: template.id,
      name: template.name,
      fields: template.fields,
      createdAt: template.createdAt,
    },
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return parseJson<FormTemplate>(response);
};

export const importTemplate = async (id: string) => {
  const response = await apiFetch(`/templates/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return parseJson<FormTemplate>(response);
};
