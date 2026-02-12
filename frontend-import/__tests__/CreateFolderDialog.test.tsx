import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CreateFolderDialog from "@/components/ActionBar/CreateFolderDialog/CreateFolderDialog";

describe("CreateFolderDialog", () => {
  it("disables create for duplicate name", async () => {
    const user = userEvent.setup();

    render(
      <CreateFolderDialog
        open
        existingNames={["Kitchen"]}
        onClose={jest.fn()}
        onCreate={jest.fn()}
      />,
    );

    const input = screen.getByLabelText("Folder name");
    await user.type(input, "Kitchen");
    await user.tab();

    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
  });
});
