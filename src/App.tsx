import { useState } from "preact/hooks";
import { BottomNav } from "./components/BottomNav.tsx";
import { HomeScreen } from "./components/HomeScreen.tsx";
import { InitialTest } from "./components/InitialTest.tsx";
import { ProgressScreen } from "./components/ProgressScreen.tsx";
import { SettingsScreen } from "./components/SettingsScreen.tsx";
import { Toast } from "./components/Toast.tsx";
import { WorkoutScreen } from "./components/WorkoutScreen.tsx";
import { useRouter } from "./hooks/useRouter.ts";
import { useStorage } from "./hooks/useStorage.ts";
import type { WorkoutRecord } from "./stores/db.ts";

export function App() {
	const { data, loading, error, update } = useStorage();
	const { route, navigate } = useRouter();
	const [toastMessage, setToastMessage] = useState<string | null>(null);

	if (loading) {
		return (
			<main>
				<p>Ładowanie...</p>
			</main>
		);
	}

	if (error) {
		return (
			<main>
				<p>Błąd: {error.message}</p>
			</main>
		);
	}

	const needsTest = data?.level === null;

	const handleTestComplete = async (pushups: number, level: number) => {
		await update({
			testResult: pushups,
			level,
			currentWeek: 1,
			currentDay: 1,
		});
	};

	if (needsTest) {
		return (
			<main>
				<InitialTest onComplete={handleTestComplete} />
			</main>
		);
	}

	const handleStartWorkout = () => {
		navigate("workout");
	};

	const incrementWeekAttempt = () => {
		if (!data) return {};
		const currentAttempt = data.weekAttempts[data.currentWeek] ?? 1;
		return {
			currentDay: 1,
			weekAttempts: {
				...data.weekAttempts,
				[data.currentWeek]: currentAttempt + 1,
			},
		};
	};

	const handleWorkoutComplete = async (
		record: WorkoutRecord,
		repeatWeek: boolean,
	) => {
		if (!data) return;
		const newWorkouts = [...data.workouts, record];

		if (repeatWeek) {
			await update({ workouts: newWorkouts, ...incrementWeekAttempt() });
		} else {
			const nextDay = data.currentDay + 1;
			const advancesWeek = nextDay > 3;
			await update({
				workouts: newWorkouts,
				currentWeek: advancesWeek ? data.currentWeek + 1 : data.currentWeek,
				currentDay: advancesWeek ? 1 : nextDay,
			});
		}
		navigate("home");
	};

	const handleWorkoutCancel = () => navigate("home");

	const handleRetakeTest = () =>
		update({
			level: null,
			testResult: null,
			currentWeek: 1,
			currentDay: 1,
			workouts: [],
			weekAttempts: {},
		});

	const handleRepeatWeek = async () => {
		if (!data) return;
		const updates = incrementWeekAttempt();
		await update(updates);
		setToastMessage(
			`Tydzień ${data.currentWeek} - Próba ${updates.weekAttempts?.[data.currentWeek]}`,
		);
	};

	const renderScreen = () => {
		if (!data) return null;
		switch (route) {
			case "home":
				return <HomeScreen data={data} onStartWorkout={handleStartWorkout} />;
			case "progress":
				return (
					<ProgressScreen
						data={data}
						onRepeatWeek={handleRepeatWeek}
						onNavigateHome={() => navigate("home")}
					/>
				);
			case "settings":
				return <SettingsScreen data={data} onRetakeTest={handleRetakeTest} />;
			case "workout":
				return (
					<WorkoutScreen
						data={data}
						onComplete={handleWorkoutComplete}
						onCancel={handleWorkoutCancel}
					/>
				);
		}
	};

	const showNav = route !== "workout";

	return (
		<main>
			{renderScreen()}
			{showNav && <BottomNav route={route} onNavigate={navigate} />}
			{toastMessage && (
				<Toast message={toastMessage} onClose={() => setToastMessage(null)} />
			)}
		</main>
	);
}
