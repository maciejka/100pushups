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
			// After loading, it should show either the test or the main app
			const hasTest = screen.queryByText("Test początkowy");
			const hasMain = screen.queryByText("100 Pompek");
			expect(hasTest || hasMain).toBeTruthy();
		});
	});
});
