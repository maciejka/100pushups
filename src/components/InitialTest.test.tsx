import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { InitialTest } from "./InitialTest.tsx";

afterEach(() => {
	cleanup();
});

describe("TEST-TEST-001: Initial fitness test flow", () => {
	it("displays instructions", () => {
		const onComplete = mock(() => {});
		render(<InitialTest onComplete={onComplete} />);

		// Verify title is displayed
		expect(screen.getByText("Test początkowy")).toBeTruthy();

		// Verify instructions section
		expect(screen.getByText("Instrukcja:")).toBeTruthy();
		expect(screen.getByText(/Rozgrzej się przez kilka minut/)).toBeTruthy();
		expect(screen.getByText(/Wykonaj maksymalną liczbę pompek/)).toBeTruthy();
		expect(screen.getByText(/Pamiętaj o prawidłowej technice/)).toBeTruthy();
		expect(
			screen.getByText(/Wpisz poniżej ile pompek udało Ci się wykonać/),
		).toBeTruthy();

		// Verify input label
		expect(screen.getByText(/Liczba wykonanych pompek/)).toBeTruthy();

		// Verify submit button
		expect(screen.getByText("Zapisz wynik")).toBeTruthy();
	});

	it("allows entering pushup count and submitting", () => {
		const onComplete = mock(() => {});
		render(<InitialTest onComplete={onComplete} />);

		const input = screen.getByPlaceholderText("0") as HTMLInputElement;
		const submitButton = screen.getByText("Zapisz wynik");

		// Enter pushup count
		fireEvent.input(input, { target: { value: "15" } });
		expect(input.value).toBe("15");

		// Submit the form
		fireEvent.click(submitButton);

		// Verify onComplete was called with correct values
		expect(onComplete).toHaveBeenCalledTimes(1);
		expect(onComplete).toHaveBeenCalledWith(15, 3); // 15 pushups = Level 3
	});

	it("calls onComplete with correct level for various pushup counts", () => {
		const testCases = [
			{ pushups: 5, expectedLevel: 1 },
			{ pushups: 8, expectedLevel: 2 },
			{ pushups: 15, expectedLevel: 3 },
			{ pushups: 23, expectedLevel: 4 },
			{ pushups: 30, expectedLevel: 5 },
		];

		for (const { pushups, expectedLevel } of testCases) {
			const onComplete = mock(() => {});
			const { unmount } = render(<InitialTest onComplete={onComplete} />);

			const input = screen.getByPlaceholderText("0") as HTMLInputElement;
			const submitButton = screen.getByText("Zapisz wynik");

			fireEvent.input(input, { target: { value: String(pushups) } });
			fireEvent.click(submitButton);

			expect(onComplete).toHaveBeenCalledWith(pushups, expectedLevel);

			unmount();
			cleanup();
		}
	});

	it("shows error for invalid input", () => {
		const onComplete = mock(() => {});
		render(<InitialTest onComplete={onComplete} />);

		const submitButton = screen.getByText("Zapisz wynik");

		// Try to submit without entering a value
		fireEvent.click(submitButton);

		// Should show error
		expect(screen.getByText("Wprowadź prawidłową liczbę")).toBeTruthy();

		// onComplete should not be called
		expect(onComplete).not.toHaveBeenCalled();
	});

	it("shows error for negative input", () => {
		const onComplete = mock(() => {});
		const { container } = render(<InitialTest onComplete={onComplete} />);

		const input = screen.getByPlaceholderText("0") as HTMLInputElement;
		const form = container.querySelector("form") as HTMLFormElement;

		// Enter negative value
		fireEvent.input(input, { target: { value: "-5" } });
		fireEvent.submit(form);

		// Should show error
		expect(screen.getByText("Wprowadź prawidłową liczbę")).toBeTruthy();

		// onComplete should not be called
		expect(onComplete).not.toHaveBeenCalled();
	});

	it("clears error when input changes", () => {
		const onComplete = mock(() => {});
		render(<InitialTest onComplete={onComplete} />);

		const input = screen.getByPlaceholderText("0") as HTMLInputElement;
		const submitButton = screen.getByText("Zapisz wynik");

		// Trigger error first
		fireEvent.click(submitButton);
		expect(screen.getByText("Wprowadź prawidłową liczbę")).toBeTruthy();

		// Now enter a valid value - error should clear
		fireEvent.input(input, { target: { value: "10" } });
		expect(screen.queryByText("Wprowadź prawidłową liczbę")).toBeNull();
	});
});

describe("DESIGN-012: Stefan's name NOT in initial test header", () => {
	it("does NOT display Stefan's name in header", () => {
		const onComplete = mock(() => {});
		render(<InitialTest onComplete={onComplete} />);

		// InitialTest should show "Test początkowy" NOT "Stefan · Test początkowy"
		expect(screen.getByText("Test początkowy")).toBeTruthy();
		expect(screen.queryByText(/Stefan/)).toBeNull();
	});
});

describe("DESIGN-009: Initial test screen compact layout", () => {
	it("uses initial-test class for compact layout", () => {
		const onComplete = mock(() => {});
		const { container } = render(<InitialTest onComplete={onComplete} />);

		// Verify the component uses the initial-test class
		const testScreen = container.querySelector(".initial-test");
		expect(testScreen).toBeTruthy();
	});

	it("displays all elements in compact form without scrolling requirement", () => {
		const onComplete = mock(() => {});
		const { container } = render(<InitialTest onComplete={onComplete} />);

		// Verify instructions section exists
		const instructions = container.querySelector(".instructions");
		expect(instructions).toBeTruthy();

		// Verify form exists
		const form = container.querySelector("form");
		expect(form).toBeTruthy();

		// Verify all critical elements are present
		expect(screen.getByText("Test początkowy")).toBeTruthy();
		expect(screen.getByText("Instrukcja:")).toBeTruthy();
		expect(screen.getByPlaceholderText("0")).toBeTruthy();
		expect(screen.getByText("Zapisz wynik")).toBeTruthy();
	});
});
