import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SearchBar from "@/components/SearchBar/SearchBar";

describe("SearchBar", () => {
  it("triggers search on Enter", async () => {
    const user = userEvent.setup();
    const handleSearch = jest.fn();

    render(
      <SearchBar value="" onChange={jest.fn()} onSearch={handleSearch} />,
    );

    const input = screen.getByPlaceholderText("Search items and folders...");
    await user.type(input, "Toaster{enter}");

    expect(handleSearch).toHaveBeenCalledTimes(1);
  });
});
