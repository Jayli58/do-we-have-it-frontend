import { render, screen } from "@testing-library/react";

import InventoryList from "@/components/InventoryList/InventoryList";

describe("InventoryList", () => {
  it("shows the empty state when no data", () => {
    render(<InventoryList folders={[]} items={[]} />);

    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });
});
