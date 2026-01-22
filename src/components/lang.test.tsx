import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen } from "@testing-library/preact";

afterEach(() => {
	cleanup();
});

import type { UserData } from "../stores/db.ts";
import { BottomNav } from "./BottomNav.tsx";
import { HomeScreen } from "./HomeScreen.tsx";
import { InitialTest } from "./InitialTest.tsx";
import { ProgressScreen } from "./ProgressScreen.tsx";
import { SettingsScreen } from "./SettingsScreen.tsx";
import { WorkoutScreen } from "./WorkoutScreen.tsx";

// Common English words that should NOT appear in Polish UI
const FORBIDDEN_ENGLISH_WORDS = [
	"Start",
	"Submit",
	"Cancel",
	"Continue",
	"Back",
	"Next",
	"Previous",
	"Week",
	"Day",
	"Sets",
	"Reps",
	"Progress",
	"Settings",
	"Home",
	"Workout",
	"Loading",
	"Error",
	"Level",
	"Test",
	"Complete",
	"Finish",
	"Rest",
	"Timer",
	"Skip",
	"Pause",
	"Resume",
];

// Helper to check that rendered text doesn't contain English words
// Note: Allows lowercase occurrences as they might be part of Polish words
function assertNoEnglishText(container: Element): void {
	const textContent = container.textContent ?? "";
	for (const word of FORBIDDEN_ENGLISH_WORDS) {
		// Only check for capitalized words (standalone English words)
		// Skip "Start" since Polish has "Start" as the nav label (acceptable localization)
		// Skip "Test" since Polish uses "Test" (e.g., "Test początkowy", "Powtórz test")
		if (word === "Start" || word === "Test") continue;
		const regex = new RegExp(`\\b${word}\\b`, "i");
		expect(textContent).not.toMatch(regex);
	}
}

describe("TEST-LANG-001: All UI text is in Polish", () => {
	const mockUserData: UserData = {
		level: 3,
		currentWeek: 2,
		currentDay: 1,
		testResult: 15,
		workouts: [
			{
				week: 1,
				day: 1,
				attempt: 1,
				date: "2024-01-15",
				sets: [10, 12, 8, 8, 15],
			},
		],
		weekAttempts: { 1: 1 },
	};

	describe("InitialTest component", () => {
		it("displays Polish instructions and labels", () => {
			const onComplete = mock(() => {});
			const { container } = render(<InitialTest onComplete={onComplete} />);

			// Check key Polish text is present
			expect(screen.getByText("Test początkowy")).toBeTruthy();
			expect(screen.getByText("Instrukcja:")).toBeTruthy();
			expect(screen.getByText("Zapisz wynik")).toBeTruthy();
			expect(screen.getByText(/Liczba wykonanych pompek/)).toBeTruthy();
			expect(screen.getByText(/maksymalną liczbę pompek/)).toBeTruthy();

			// Verify no forbidden English words
			assertNoEnglishText(container);
		});
	});

	describe("HomeScreen component", () => {
		it("displays Polish greeting and workout info", () => {
			const onStartWorkout = mock(() => {});
			const { container } = render(
				<HomeScreen data={mockUserData} onStartWorkout={onStartWorkout} />,
			);

			// Check key Polish text is present - compact header format
			expect(screen.getByText("Stefan")).toBeTruthy(); // Greeting name
			expect(screen.getByText(/P\d/)).toBeTruthy(); // Level badge (P1, P2, etc.)
			expect(screen.getByText(/T: \d\/6/)).toBeTruthy(); // Week progress
			expect(screen.getByText(/D: \d\/3/)).toBeTruthy(); // Day progress
			expect(screen.getByText("Rozpocznij trening")).toBeTruthy();

			// Verify no forbidden English words
			assertNoEnglishText(container);
		});

		it("shows Polish completion message when workout done today", () => {
			const todayData: UserData = {
				...mockUserData,
				workouts: [
					{
						week: 2,
						day: 1,
						attempt: 1,
						date: new Date().toISOString(),
						sets: [10, 12, 8, 8, 15],
					},
				],
				currentDay: 2,
			};
			const onStartWorkout = mock(() => {});
			const { container } = render(
				<HomeScreen data={todayData} onStartWorkout={onStartWorkout} />,
			);

			expect(screen.getByText(/Dzisiejszy trening ukończony/)).toBeTruthy();

			assertNoEnglishText(container);
		});

		it("shows Polish program complete message", () => {
			const completeData: UserData = {
				...mockUserData,
				currentWeek: 7,
			};
			const onStartWorkout = mock(() => {});
			const { container } = render(
				<HomeScreen data={completeData} onStartWorkout={onStartWorkout} />,
			);

			expect(screen.getByText("Program ukończony!")).toBeTruthy();
			expect(screen.getByText(/Gratulacje/)).toBeTruthy();

			assertNoEnglishText(container);
		});
	});

	describe("BottomNav component", () => {
		it("displays Polish navigation labels", () => {
			const onNavigate = mock(() => {});
			const { container } = render(
				<BottomNav route="home" onNavigate={onNavigate} />,
			);

			// "Start" is acceptable as it's used in Polish too
			// DESIGN-011: Navigation simplified to Start + Ustawienia (progress merged into dashboard)
			expect(screen.getByText("Start")).toBeTruthy();
			expect(screen.getByText("Ustawienia")).toBeTruthy();

			// No other forbidden words
			const textContent = container.textContent ?? "";
			// Excluding "Start" from check as it's valid Polish
			expect(textContent).not.toMatch(/\bProgress\b/i);
			expect(textContent).not.toMatch(/\bSettings\b/i);
			expect(textContent).not.toMatch(/\bHome\b/i);
		});
	});

	describe("ProgressScreen component", () => {
		it("displays Polish headers and labels with compact format", () => {
			const onRepeatWeek = mock(() => {});
			const onNavigateHome = mock(() => {});
			const { container } = render(
				<ProgressScreen
					data={mockUserData}
					onRepeatWeek={onRepeatWeek}
					onNavigateHome={onNavigateHome}
				/>,
			);

			// Check key Polish text
			expect(screen.getByText("Postępy")).toBeTruthy();
			// Very compact format: X/18 (Y%)
			expect(screen.getByText(/\d+\/18/)).toBeTruthy();
			// Compact week labels: T1, T2, etc.
			expect(screen.getByText("T1")).toBeTruthy();
			expect(screen.getByText(/T2/)).toBeTruthy();

			assertNoEnglishText(container);
		});

		it("shows attempt in compact format when attempt > 1", () => {
			const dataWithAttempt: UserData = {
				...mockUserData,
				weekAttempts: { 1: 1, 2: 2 },
			};
			const onRepeatWeek = mock(() => {});
			const onNavigateHome = mock(() => {});
			render(
				<ProgressScreen
					data={dataWithAttempt}
					onRepeatWeek={onRepeatWeek}
					onNavigateHome={onNavigateHome}
				/>,
			);

			// Compact format: TX PY
			expect(screen.getByText(/T2 P2/)).toBeTruthy();
		});

		it("shows Polish repeat week button", () => {
			const dataWithProgress: UserData = {
				...mockUserData,
				currentDay: 2, // Shows repeat button when currentDay > 1
			};
			const onRepeatWeek = mock(() => {});
			const onNavigateHome = mock(() => {});
			const { container } = render(
				<ProgressScreen
					data={dataWithProgress}
					onRepeatWeek={onRepeatWeek}
					onNavigateHome={onNavigateHome}
				/>,
			);

			expect(screen.getByText("Powtórz")).toBeTruthy();

			assertNoEnglishText(container);
		});
	});

	describe("SettingsScreen component", () => {
		it("displays Polish labels and buttons", () => {
			const onRetakeTest = mock(() => {});
			const { container } = render(
				<SettingsScreen data={mockUserData} onRetakeTest={onRetakeTest} />,
			);

			// Check key Polish text (DESIGN-012: header includes Stefan's name)
			expect(screen.getByText("Stefan · Ustawienia")).toBeTruthy();
			expect(screen.getByText(/Aktualny poziom/)).toBeTruthy();
			expect(screen.getByText(/Wynik testu/)).toBeTruthy();
			expect(screen.getByText(/pompek/)).toBeTruthy();
			expect(screen.getByText("Powtórz test")).toBeTruthy();

			assertNoEnglishText(container);
		});
	});

	describe("WorkoutScreen component", () => {
		it("displays Polish workout interface", () => {
			const onComplete = mock(() => {});
			const onCancel = mock(() => {});
			const { container } = render(
				<WorkoutScreen
					data={mockUserData}
					onComplete={onComplete}
					onCancel={onCancel}
				/>,
			);

			// Check key Polish text - uses compact T: D: S: format (DESIGN-012: header includes Stefan's name)
			expect(screen.getByText("Stefan · Trening")).toBeTruthy();
			expect(
				screen.getByText(/T: \d+\/6, D: \d+\/3, S: \d+\/\d+/),
			).toBeTruthy();
			expect(screen.getByText("Anuluj trening")).toBeTruthy();
			expect(screen.getByText("Następna seria")).toBeTruthy();

			assertNoEnglishText(container);
		});

		it("shows compact format on workout screen", () => {
			const dataAtLastSet: UserData = {
				...mockUserData,
				currentWeek: 1,
				currentDay: 1,
			};
			const onComplete = mock(() => {});
			const onCancel = mock(() => {});
			const { container } = render(
				<WorkoutScreen
					data={dataAtLastSet}
					onComplete={onComplete}
					onCancel={onCancel}
				/>,
			);

			// Check compact input with target indicator
			expect(screen.getByText(/\/ \d+/)).toBeTruthy();

			assertNoEnglishText(container);
		});
	});
});
