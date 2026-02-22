import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EditItemDialog from "@/components/ItemDialogs/EditItemDialog";
import type { Item } from "@/types";

const item: Item = {
  id: "item-1",
  name: "Toaster",
  comments: "Counter",
  parentId: null,
  imageName: "manual.png",
  createdAt: "2025-01-01",
  updatedAt: "2025-01-01",
  attributes: [
    {
      fieldId: "field-model",
      fieldName: "Model",
      value: "ToastPro",
    },
  ],
};

describe("EditItemDialog", () => {
  it("blocks save when required attribute is empty", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();

    render(
      <EditItemDialog
        open
        item={item}
        fields={[
          {
            id: "field-model",
            name: "Model",
            type: "text",
            required: true,
          },
        ]}
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

    const field = screen.getByLabelText("Model");
    await user.clear(field);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("marks image removed when user deletes it", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();

    render(
      <EditItemDialog
        open
        item={item}
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Remove" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        imageName: null,
        imageFile: null,
        imageRemoved: true,
      }),
    );
  });
});
