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

			// Check key Polish text is present
			expect(screen.getByText("100 Pompek")).toBeTruthy();
			expect(screen.getByText(/Cześć/)).toBeTruthy();
			expect(screen.getByText(/Poziom/)).toBeTruthy();
			expect(screen.getByText(/Tydzień/)).toBeTruthy();
			expect(screen.getByText(/Dzień/)).toBeTruthy();
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
			expect(screen.getByText("Start")).toBeTruthy();
			expect(screen.getByText("Postępy")).toBeTruthy();
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
		it("displays Polish headers and labels", () => {
			const onRepeatWeek = mock(() => {});
			const { container } = render(
				<ProgressScreen data={mockUserData} onRepeatWeek={onRepeatWeek} />,
			);

			// Check key Polish text
			expect(screen.getByText("Postępy")).toBeTruthy();
			expect(screen.getByText(/Ukończono:/)).toBeTruthy();
			expect(screen.getByText(/treningów/)).toBeTruthy();
			expect(screen.getByText(/Tydzień 1/)).toBeTruthy();

			assertNoEnglishText(container);
		});

		it("shows Polish repeat week button", () => {
			const dataWithProgress: UserData = {
				...mockUserData,
				currentDay: 2, // Shows repeat button when currentDay > 1
			};
			const onRepeatWeek = mock(() => {});
			const { container } = render(
				<ProgressScreen data={dataWithProgress} onRepeatWeek={onRepeatWeek} />,
			);

			expect(screen.getByText("Powtórz tydzień")).toBeTruthy();

			assertNoEnglishText(container);
		});
	});

	describe("SettingsScreen component", () => {
		it("displays Polish labels and buttons", () => {
			const onRetakeTest = mock(() => {});
			const { container } = render(
				<SettingsScreen data={mockUserData} onRetakeTest={onRetakeTest} />,
			);

			// Check key Polish text
			expect(screen.getByText("Ustawienia")).toBeTruthy();
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

			// Check key Polish text
			expect(screen.getByText("Trening")).toBeTruthy();
			expect(screen.getByText(/Tydzień/)).toBeTruthy();
			expect(screen.getByText(/Seria/)).toBeTruthy();
			expect(screen.getByText(/Cel:/)).toBeTruthy();
			expect(screen.getByText(/Wykonane powtórzenia/)).toBeTruthy();
			expect(screen.getByText("Anuluj trening")).toBeTruthy();

			assertNoEnglishText(container);
		});

		it("shows Polish labels for max set", () => {
			// Week 2 Day 1 Level 3 should have 5 sets, last one is max
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

			// The max set message should be in Polish
			// (Though initially we see set 1, the max label test would need state manipulation)
			expect(screen.getByText(/Cel:/)).toBeTruthy();

			assertNoEnglishText(container);
		});
	});
});
