import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { BottomNav } from "./BottomNav.tsx";

afterEach(() => {
	cleanup();
});

describe("BottomNav component", () => {
	it("renders 3 navigation buttons", () => {
		const onNavigate = mock(() => {});
		render(<BottomNav route="home" onNavigate={onNavigate} />);

		const buttons = screen.getAllByRole("button");
		expect(buttons).toHaveLength(3);
	});

	it("clicking home button calls onNavigate with 'home'", () => {
		const onNavigate = mock(() => {});
		render(<BottomNav route="progress" onNavigate={onNavigate} />);

		const homeButton = screen.getByText("Start").closest("button") as Element;
		fireEvent.click(homeButton);

		expect(onNavigate).toHaveBeenCalledWith("home");
	});

	it("clicking progress button calls onNavigate with 'progress'", () => {
		const onNavigate = mock(() => {});
		render(<BottomNav route="home" onNavigate={onNavigate} />);

		const progressButton = screen
			.getByText("Postępy")
			.closest("button") as Element;
		fireEvent.click(progressButton);

		expect(onNavigate).toHaveBeenCalledWith("progress");
	});

	it("clicking settings button calls onNavigate with 'settings'", () => {
		const onNavigate = mock(() => {});
		render(<BottomNav route="home" onNavigate={onNavigate} />);

		const settingsButton = screen
			.getByText("Ustawienia")
			.closest("button") as Element;
		fireEvent.click(settingsButton);

		expect(onNavigate).toHaveBeenCalledWith("settings");
	});

	it("applies active class to home button when route is home", () => {
		const onNavigate = mock(() => {});
		render(<BottomNav route="home" onNavigate={onNavigate} />);

		const homeButton = screen.getByText("Start").closest("button");
		const progressButton = screen.getByText("Postępy").closest("button");
		const settingsButton = screen.getByText("Ustawienia").closest("button");

		expect(homeButton?.className).toContain("active");
		expect(progressButton?.className).not.toContain("active");
		expect(settingsButton?.className).not.toContain("active");
	});

	it("applies active class to progress button when route is progress", () => {
		const onNavigate = mock(() => {});
		render(<BottomNav route="progress" onNavigate={onNavigate} />);

		const homeButton = screen.getByText("Start").closest("button");
		const progressButton = screen.getByText("Postępy").closest("button");
		const settingsButton = screen.getByText("Ustawienia").closest("button");

		expect(homeButton?.className).not.toContain("active");
		expect(progressButton?.className).toContain("active");
		expect(settingsButton?.className).not.toContain("active");
	});

	it("applies active class to settings button when route is settings", () => {
		const onNavigate = mock(() => {});
		render(<BottomNav route="settings" onNavigate={onNavigate} />);

		const homeButton = screen.getByText("Start").closest("button");
		const progressButton = screen.getByText("Postępy").closest("button");
		const settingsButton = screen.getByText("Ustawienia").closest("button");

		expect(homeButton?.className).not.toContain("active");
		expect(progressButton?.className).not.toContain("active");
		expect(settingsButton?.className).toContain("active");
	});
});
