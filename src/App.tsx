import { BottomNav } from "./components/BottomNav.tsx";
import { HomeScreen } from "./components/HomeScreen.tsx";
import { InitialTest } from "./components/InitialTest.tsx";
import { ProgressScreen } from "./components/ProgressScreen.tsx";
import { SettingsScreen } from "./components/SettingsScreen.tsx";
import { useRouter } from "./hooks/useRouter.ts";
import { useStorage } from "./hooks/useStorage.ts";

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

	const renderScreen = () => {
		if (!data) return null;
		switch (route) {
			case "home":
				return <HomeScreen data={data} />;
			case "progress":
				return <ProgressScreen data={data} />;
			case "settings":
				return <SettingsScreen data={data} />;
		}
	};

	return (
		<main>
			{renderScreen()}
			<BottomNav route={route} onNavigate={navigate} />
		</main>
	);
}
