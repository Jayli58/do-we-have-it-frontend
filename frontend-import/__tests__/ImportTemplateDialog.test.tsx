import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ImportTemplateDialog from "@/components/FormTemplateManager/ImportTemplateDialog/ImportTemplateDialog";
import type { FormTemplate } from "@/types";

const templates: FormTemplate[] = [
  {
    id: "tmpl-1",
    name: "Sample",
    createdAt: "2025-01-01",
    fields: [],
  },
];

describe("ImportTemplateDialog", () => {
  it("calls onSelect when template is chosen", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <ImportTemplateDialog
        open
        templates={templates}
        onClose={jest.fn()}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByText("Sample"));
    expect(onSelect).toHaveBeenCalledWith(templates[0]);
  });
});
