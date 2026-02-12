import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

describe("DeleteConfirmDialog", () => {
  it("calls onConfirm when delete clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();

    render(
      <DeleteConfirmDialog
        open
        onCancel={jest.fn()}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
