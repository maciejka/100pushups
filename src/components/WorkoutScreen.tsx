import { useEffect, useRef, useState } from "preact/hooks";
import { getWorkout, isMaxSet } from "../data/program.ts";
import type { UserData, WorkoutRecord } from "../stores/db.ts";

function playBeep(): void {
	const audioContext = new AudioContext();
	const oscillator = audioContext.createOscillator();
	const gainNode = audioContext.createGain();

	oscillator.connect(gainNode);
	gainNode.connect(audioContext.destination);

	oscillator.frequency.value = 800;
	oscillator.type = "sine";
	gainNode.gain.value = 0.3;

	oscillator.start();
	oscillator.stop(audioContext.currentTime + 0.3);
}

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
	const [isResting, setIsResting] = useState(false);
	const [restTimeLeft, setRestTimeLeft] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const [isComplete, setIsComplete] = useState(false);
	const [finalRecord, setFinalRecord] = useState<WorkoutRecord | null>(null);
	const skippedRef = useRef(false);

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

	// Format seconds as mm:ss
	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
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

	const handleFinish = () => {
		if (finalRecord) {
			onComplete(finalRecord);
		}
	};

	// Completion screen
	if (isComplete && finalRecord) {
		const totalReps = finalRecord.sets.reduce((sum, reps) => sum + reps, 0);
		return (
			<div class="screen workout-screen complete-screen">
				<h1>Trening ukończony!</h1>
				<p class="workout-info">
					Tydzień {finalRecord.week}, Dzień {finalRecord.day}
				</p>
				<div class="completion-summary">
					<p class="total-reps">
						Łącznie: <strong>{totalReps}</strong> powtórzeń
					</p>
					<div class="completed-sets">
						<p>Twoje serie:</p>
						<ul>
							{finalRecord.sets.map((reps, i) => (
								<li key={i}>
									Seria {i + 1}: {reps} powtórzeń
								</li>
							))}
						</ul>
					</div>
				</div>
				<div class="workout-actions">
					<button type="button" class="btn-primary" onClick={handleFinish}>
						Zakończ
					</button>
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
					Tydzień {data.currentWeek}, Dzień {data.currentDay}
				</p>
				<div class="set-progress">
					Następna: Seria {currentSet + 1} z {totalSets}
				</div>
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
