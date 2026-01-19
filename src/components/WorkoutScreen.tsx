import { useState } from "preact/hooks";
import { getWorkout, isMaxSet } from "../data/program.ts";
import type { UserData, WorkoutRecord } from "../stores/db.ts";

interface WorkoutScreenProps {
	data: UserData;
	onComplete: (record: WorkoutRecord) => void;
	onCancel: () => void;
}

export function WorkoutScreen({
	data,
	onComplete,
	onCancel,
}: WorkoutScreenProps) {
	const level = data.level as 1 | 2 | 3 | 4 | 5;
	const workout = getWorkout(level, data.currentWeek, data.currentDay);
	const [currentSet, setCurrentSet] = useState(0);
	const [completedReps, setCompletedReps] = useState<number[]>([]);
	const [inputValue, setInputValue] = useState("");

	if (!workout) {
		return (
			<div class="screen workout-screen">
				<p>Błąd: nie znaleziono treningu</p>
				<button type="button" onClick={onCancel}>
					Wróć
				</button>
			</div>
		);
	}

	const totalSets = workout.sets.length;
	const targetReps = workout.sets[currentSet] ?? 0;
	const isMax = isMaxSet(targetReps);

	const handleSubmitSet = () => {
		const reps = Number.parseInt(inputValue, 10);
		if (Number.isNaN(reps) || reps < 0) {
			return;
		}

		const newCompletedReps = [...completedReps, reps];
		setCompletedReps(newCompletedReps);
		setInputValue("");

		if (currentSet + 1 >= totalSets) {
			const attempt = data.weekAttempts[data.currentWeek] ?? 1;
			const record: WorkoutRecord = {
				week: data.currentWeek,
				day: data.currentDay,
				attempt,
				date: new Date().toISOString(),
				sets: newCompletedReps,
			};
			onComplete(record);
		} else {
			setCurrentSet(currentSet + 1);
		}
	};

	return (
		<div class="screen workout-screen">
			<h1>Trening</h1>
			<p class="workout-info">
				Tydzień {data.currentWeek}, Dzień {data.currentDay}
			</p>
			<div class="set-progress">
				Seria {currentSet + 1} z {totalSets}
			</div>
			<div class="set-target">
				{isMax ? (
					<>
						<span class="target-label">Cel:</span>
						<span class="target-value max">maksimum</span>
						<p class="max-hint">Zrób tyle powtórzeń, ile dasz radę!</p>
					</>
				) : (
					<>
						<span class="target-label">Cel:</span>
						<span class="target-value">{targetReps}</span>
					</>
				)}
			</div>
			<div class="rep-input">
				<label>
					Wykonane powtórzenia:
					<input
						type="number"
						min="0"
						value={inputValue}
						onInput={(e) => setInputValue((e.target as HTMLInputElement).value)}
						placeholder={isMax ? "ile zrobiłeś?" : String(targetReps)}
					/>
				</label>
			</div>
			<div class="workout-actions">
				<button
					type="button"
					class="btn-primary"
					onClick={handleSubmitSet}
					disabled={inputValue === "" || Number.parseInt(inputValue, 10) < 0}
				>
					{currentSet + 1 >= totalSets ? "Zakończ trening" : "Następna seria"}
				</button>
			</div>
			{completedReps.length > 0 && (
				<div class="completed-sets">
					<p>Ukończone serie:</p>
					<ul>
						{completedReps.map((reps, i) => (
							<li key={i}>
								Seria {i + 1}: {reps} powtórzeń
							</li>
						))}
					</ul>
				</div>
			)}
			<button type="button" class="btn-cancel" onClick={onCancel}>
				Anuluj trening
			</button>
		</div>
	);
}
