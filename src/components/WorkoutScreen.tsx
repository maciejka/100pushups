import { useEffect, useRef, useState } from "preact/hooks";
import { getWorkout, isMaxSet } from "../data/program.ts";
import type { UserData, WorkoutRecord } from "../stores/db.ts";
import { Confetti } from "./Confetti.tsx";

function playBeep(): void {
	const ctx = new AudioContext();
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.connect(gain).connect(ctx.destination);
	osc.frequency.value = 800;
	gain.gain.value = 0.3;
	osc.start();
	osc.stop(ctx.currentTime + 0.3);
}

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function SetsList({
	reps,
	label = "Ukończone serie:",
}: {
	reps: number[];
	label?: string;
}) {
	if (reps.length === 0) return null;
	return (
		<div class="completed-sets">
			<p>{label}</p>
			<ul>
				{reps.map((r, i) => (
					<li key={i}>
						Seria {i + 1}: {r} powtórzeń
					</li>
				))}
			</ul>
		</div>
	);
}

interface WorkoutScreenProps {
	data: UserData;
	onComplete: (record: WorkoutRecord, repeatWeek: boolean) => void;
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
	const [isResting, setIsResting] = useState(false);
	const [restTimeLeft, setRestTimeLeft] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const [isComplete, setIsComplete] = useState(false);
	const [finalRecord, setFinalRecord] = useState<WorkoutRecord | null>(null);
	const skippedRef = useRef(false);

	// Prefill input with target reps when set changes (or on initial load)
	useEffect(() => {
		if (!workout) return;
		const target = workout.sets[currentSet] ?? 0;
		const isMaximum = isMaxSet(target);
		if (isMaximum) {
			// For max set, leave empty or show previous max if available
			setInputValue("");
		} else {
			setInputValue(String(target));
		}
	}, [currentSet, workout]);

	// Rest timer countdown effect
	useEffect(() => {
		if (!isResting || restTimeLeft <= 0 || isPaused) return;

		const timer = setInterval(() => {
			setRestTimeLeft((prev) => {
				if (prev <= 1) {
					if (!skippedRef.current) {
						playBeep();
					}
					skippedRef.current = false;
					setIsResting(false);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [isResting, restTimeLeft, isPaused]);

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

	// Find previous attempt for this week/day (if repeating)
	const currentAttempt = data.weekAttempts[data.currentWeek] ?? 1;
	const previousAttemptWorkout =
		currentAttempt > 1
			? data.workouts.find(
					(w) =>
						w.week === data.currentWeek &&
						w.day === data.currentDay &&
						w.attempt === currentAttempt - 1,
				)
			: null;
	const previousReps = previousAttemptWorkout?.sets[currentSet];

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
			setFinalRecord(record);
			setIsComplete(true);
		} else {
			// Start rest timer before moving to next set
			setRestTimeLeft(workout.rest);
			setIsResting(true);
			setCurrentSet(currentSet + 1);
		}
	};

	const handleSkipRest = () => {
		skippedRef.current = true;
		setIsResting(false);
		setRestTimeLeft(0);
		setIsPaused(false);
	};

	const handleTogglePause = () => {
		setIsPaused((prev) => !prev);
	};

	const handleFinish = (repeatWeek: boolean) => {
		if (finalRecord) {
			onComplete(finalRecord, repeatWeek);
		}
	};

	// Completion screen
	if (isComplete && finalRecord && workout) {
		const totalReps = finalRecord.sets.reduce((sum, reps) => sum + reps, 0);
		// Count failed sets (where actual reps < target, excluding max set which is -1)
		const failedSets = finalRecord.sets.filter((reps, i) => {
			const target = workout.sets[i] ?? 0;
			return target !== -1 && reps < target;
		}).length;
		const shouldSuggestRepeat = failedSets >= 3;

		return (
			<div class="screen workout-screen complete-screen">
				{!shouldSuggestRepeat && <Confetti />}
				<h1>Świetna robota, Stefan! 🔥</h1>
				<p class="workout-info">
					T: {finalRecord.week}/6, D: {finalRecord.day}/3
				</p>
				<div class="completion-summary">
					<p class="total-reps">
						Łącznie: <strong>{totalReps}</strong> powtórzeń
					</p>
					<SetsList reps={finalRecord.sets} label="Twoje serie:" />
				</div>
				{shouldSuggestRepeat && (
					<div class="repeat-suggestion">
						<p>Nie udało Ci się osiągnąć celu w {failedSets} seriach.</p>
						<p>Zalecamy powtórzenie tego tygodnia.</p>
					</div>
				)}
				<div class="workout-actions">
					{shouldSuggestRepeat ? (
						<>
							<button
								type="button"
								class="btn-primary"
								onClick={() => handleFinish(true)}
							>
								Powtórz tydzień
							</button>
							<button
								type="button"
								class="btn-secondary"
								onClick={() => handleFinish(false)}
							>
								Kontynuuj
							</button>
						</>
					) : (
						<button
							type="button"
							class="btn-primary"
							onClick={() => handleFinish(false)}
						>
							Zakończ
						</button>
					)}
				</div>
			</div>
		);
	}

	// Rest timer screen
	if (isResting) {
		return (
			<div class="screen workout-screen rest-screen">
				<h1>Odpoczynek</h1>
				<p class="workout-info">
					T: {data.currentWeek}/6, D: {data.currentDay}/3, S: {currentSet + 1}/{totalSets}
				</p>
				<div class="rest-timer">
					<span class="timer-value">{formatTime(restTimeLeft)}</span>
				</div>
				<p class="rest-hint">Przygotuj się do następnej serii</p>
				<div class="rest-actions">
					<button
						type="button"
						class="btn-secondary"
						onClick={handleTogglePause}
					>
						{isPaused ? "Wznów" : "Pauza"}
					</button>
					<button type="button" class="btn-primary" onClick={handleSkipRest}>
						Pomiń
					</button>
				</div>
				<SetsList reps={completedReps} />
				<button type="button" class="btn-cancel" onClick={onCancel}>
					Anuluj trening
				</button>
			</div>
		);
	}

	return (
		<div class="screen workout-screen">
			<h1>Trening</h1>
			<p class="workout-info">
				T: {data.currentWeek}/6, D: {data.currentDay}/3, S: {currentSet + 1}/{totalSets}
			</p>
			<div class="rep-input-compact">
				<input
					type="number"
					min="0"
					value={inputValue}
					onInput={(e) => setInputValue((e.target as HTMLInputElement).value)}
					placeholder={isMax ? "?" : String(targetReps)}
				/>
				<span class="target-indicator">/ {isMax ? "max" : targetReps}</span>
				{previousReps !== undefined && (
					<span class="previous-reps">(poprz. {previousReps})</span>
				)}
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
			<SetsList reps={completedReps} />
			<button type="button" class="btn-cancel" onClick={onCancel}>
				Anuluj trening
			</button>
		</div>
	);
}
