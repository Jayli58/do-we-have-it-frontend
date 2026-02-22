import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CreateItemDialog from "@/components/ActionBar/CreateItemDialog/CreateItemDialog";

describe("CreateItemDialog", () => {
  it("enables create when required fields are filled", async () => {
    const user = userEvent.setup();

    render(
      <CreateItemDialog open onClose={jest.fn()} onCreate={jest.fn()} />,
    );

    const createButton = screen.getByRole("button", { name: "Create" });
    expect(createButton).toBeDisabled();

    await user.type(screen.getByLabelText("Item name"), "Toaster");
    await user.type(screen.getByLabelText("Comments"), "Kitchen shelf");

    expect(createButton).toBeEnabled();
  });

  it("prevents duplicate item names in a folder", async () => {
    const user = userEvent.setup();

    render(
      <CreateItemDialog
        open
        onClose={jest.fn()}
        onCreate={jest.fn()}
        existingNames={["Widget"]}
      />,
    );

    const nameField = screen.getByLabelText("Item name");
    const commentsField = screen.getByLabelText("Comments");

    await user.type(nameField, "Widget");
    await user.click(commentsField);

    expect(
      screen.getByText("Item name must be unique in this folder."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
  });

  it("submits selected image metadata and file", async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn();

    render(<CreateItemDialog open onClose={jest.fn()} onCreate={onCreate} />);

    await user.type(screen.getByLabelText("Item name"), "Toaster");
    await user.type(screen.getByLabelText("Comments"), "Kitchen shelf");

    const file = new File(["image"], "photo.png", { type: "image/png" });
    const fileInput = screen.getByLabelText("Item image");
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        imageName: "photo.png",
        imageFile: file,
      }),
    );
  });
});
