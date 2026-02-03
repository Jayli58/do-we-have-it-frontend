import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";

describe("Breadcrumb", () => {
  it("calls onNavigate when clicking a breadcrumb", async () => {
    const user = userEvent.setup();
    const handleNavigate = jest.fn();

    render(
      <Breadcrumb
        items={[
          { id: null, name: "Home" },
          { id: "k1", name: "Kitchen" },
        ]}
        onNavigate={handleNavigate}
      />,
    );

    await user.click(screen.getByText("Home"));
    expect(handleNavigate).toHaveBeenCalledWith(null);
  });
});
