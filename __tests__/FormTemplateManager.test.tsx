import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FormTemplateManager from "@/components/FormTemplateManager/FormTemplateManager";

describe("FormTemplateManager", () => {
  it("shows template list and opens create dialog", async () => {
    const user = userEvent.setup();

    render(<FormTemplateManager open onClose={jest.fn()} />);

    expect(await screen.findByText("Appliance Details")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Create template" }));
    expect(
      screen.getAllByRole("heading", { name: "Create template" })[0],
    ).toBeInTheDocument();
  });
});
