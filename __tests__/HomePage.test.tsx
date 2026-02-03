import { render, screen } from "@testing-library/react";

import Home from "@/app/page";

describe("Home page", () => {
  it("renders seeded folders", async () => {
    render(<Home />);

    expect(
      await screen.findByRole("heading", { name: "Do we have it?" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Kitchen/")).toBeInTheDocument();
  });
});
