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
});
