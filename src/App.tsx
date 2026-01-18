import { InitialTest } from "./components/InitialTest.tsx";
import { useStorage } from "./hooks/useStorage.ts";

export function App() {
	const { data, loading, error, update } = useStorage();

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

	return (
		<main>
			<h1>100 Pompek</h1>
			<p>Poziom: {data?.level}</p>
			<p>
				Tydzień {data?.currentWeek}, Dzień {data?.currentDay}
			</p>
		</main>
	);
}
