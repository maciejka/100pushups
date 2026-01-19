import { BottomNav } from "./components/BottomNav.tsx";
import { HomeScreen } from "./components/HomeScreen.tsx";
import { InitialTest } from "./components/InitialTest.tsx";
import { ProgressScreen } from "./components/ProgressScreen.tsx";
import { SettingsScreen } from "./components/SettingsScreen.tsx";
import { WorkoutScreen } from "./components/WorkoutScreen.tsx";
import { useRouter } from "./hooks/useRouter.ts";
import { useStorage } from "./hooks/useStorage.ts";
import type { WorkoutRecord } from "./stores/db.ts";

export function App() {
	const { data, loading, error, update } = useStorage();
	const { route, navigate } = useRouter();

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

	const handleWorkoutComplete = async (
		record: WorkoutRecord,
		repeatWeek: boolean,
	) => {
		if (!data) return;
		const newWorkouts = [...data.workouts, record];

		if (repeatWeek) {
			// Repeat the current week from day 1
			const currentAttempt = data.weekAttempts[data.currentWeek] ?? 1;
			await update({
				workouts: newWorkouts,
				currentDay: 1,
				weekAttempts: {
					...data.weekAttempts,
					[data.currentWeek]: currentAttempt + 1,
				},
			});
		} else {
			// Move to next day/week
			let nextWeek = data.currentWeek;
			let nextDay = data.currentDay + 1;
			if (nextDay > 3) {
				nextDay = 1;
				nextWeek = data.currentWeek + 1;
			}
			await update({
				workouts: newWorkouts,
				currentWeek: nextWeek,
				currentDay: nextDay,
			});
		}
		navigate("home");
	};

	const handleWorkoutCancel = () => {
		navigate("home");
	};

	const handleRetakeTest = async () => {
		await update({
			level: null,
			testResult: null,
			currentWeek: 1,
			currentDay: 1,
			workouts: [],
			weekAttempts: {},
		});
	};

	const renderScreen = () => {
		if (!data) return null;
		switch (route) {
			case "home":
				return <HomeScreen data={data} onStartWorkout={handleStartWorkout} />;
			case "progress":
				return <ProgressScreen data={data} />;
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
		</main>
	);
}
