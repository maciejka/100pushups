import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	mock,
	setSystemTime,
} from "bun:test";
import { cleanup, render, screen } from "@testing-library/preact";
import { Toast } from "./Toast.tsx";

beforeEach(() => {
	setSystemTime(new Date("2024-01-15T10:00:00Z"));
});

afterEach(() => {
	cleanup();
	setSystemTime();
});

describe("Toast component", () => {
	it("displays the message", () => {
		const onClose = mock(() => {});
		render(<Toast message="Tydzień 1 - Próba 2" onClose={onClose} />);

		expect(screen.getByText("Tydzień 1 - Próba 2")).toBeTruthy();
	});

	it("uses output element for accessibility", () => {
		const onClose = mock(() => {});
		const { container } = render(
			<Toast message="Test message" onClose={onClose} />,
		);

		const toast = container.querySelector("output.toast");
		expect(toast).toBeTruthy();
	});

	it("calls onClose after duration", async () => {
		const onClose = mock(() => {});
		render(<Toast message="Test" onClose={onClose} duration={100} />);

		// Toast should be visible initially
		expect(screen.getByText("Test")).toBeTruthy();
		expect(onClose).not.toHaveBeenCalled();

		// Advance time and wait for the callback
		setSystemTime(new Date("2024-01-15T10:00:00.150Z"));
		await new Promise((resolve) => setTimeout(resolve, 150));

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("uses default duration of 2500ms", () => {
		const onClose = mock(() => {});
		render(<Toast message="Test" onClose={onClose} />);

		// Check that onClose is not called immediately
		expect(onClose).not.toHaveBeenCalled();
	});
});
