import { render, screen } from "@testing-library/react";

import ActionBar from "@/components/ActionBar/ActionBar";

describe("ActionBar", () => {
  it("disables buttons without handlers", () => {
    render(<ActionBar />);

    expect(screen.getByRole("button", { name: "+ Folder" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "+ Item" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Templates" })).toBeDisabled();
  });
});
