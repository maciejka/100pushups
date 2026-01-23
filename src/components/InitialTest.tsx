import { useState } from "preact/hooks";
import { getLevelFromTest } from "../data/program.ts";

interface InitialTestProps {
	onComplete: (pushups: number, level: number) => void;
}

export function InitialTest({ onComplete }: InitialTestProps) {
	const [pushups, setPushups] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		const count = parseInt(pushups, 10);

		if (Number.isNaN(count) || count < 0) {
			setError("Wprowadź prawidłową liczbę");
			return;
		}

		const level = getLevelFromTest(count);
		onComplete(count, level);
	};

	const handleChange = (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		setPushups(value);
		setError("");
	};

	return (
		<div class="initial-test">
			<h1>100p</h1>

			<div class="instructions">
				<p>
					Cześć Stefan! Zanim rozpoczniesz program, musisz wykonać test początkowy, który
					określi Twój poziom startowy.
				</p>
				<h2>Instrukcja:</h2>
				<ol>
					<li>Rozgrzej się przez kilka minut</li>
					<li>Wykonaj maksymalną liczbę pompek w jednej serii</li>
					<li>Pamiętaj o prawidłowej technice</li>
					<li>Wpisz poniżej ile pompek udało Ci się wykonać</li>
				</ol>
			</div>

			<form onSubmit={handleSubmit}>
				<label>
					<span>Liczba wykonanych pompek:</span>
					<input
						type="number"
						min="0"
						value={pushups}
						onInput={handleChange}
						placeholder="0"
					/>
				</label>

				{error && <p class="error">{error}</p>}

				<button type="submit">Zapisz wynik</button>
			</form>
		</div>
	);
}
