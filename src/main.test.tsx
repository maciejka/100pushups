import { describe, expect, it } from "bun:test";
import { render, screen, waitFor } from "@testing-library/preact";
import { App } from "./App.tsx";

describe("100 Pushups App", () => {
	it("should load correctly", async () => {
		render(<App />);

		// App should render and show loading state initially
		expect(screen.getByText("Ładowanie...")).toBeTruthy();

		// Wait for app to finish loading and show content
		await waitFor(() => {
			// After loading, it should show '100p' header (DESIGN-012)
			// This appears on both InitialTest and Dashboard screens
			expect(screen.getByText("100p")).toBeTruthy();
		});
	});
});
