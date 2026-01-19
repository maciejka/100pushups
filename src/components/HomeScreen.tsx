import { getTargetReps, getWorkout } from "../data/program.ts";
import type { UserData } from "../stores/db.ts";

interface HomeScreenProps {
	data: UserData;
	onStartWorkout: () => void;
}

function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

// Motivational messages for Stefan
const MOTIVATIONAL_MESSAGES = [
	"Każda pompka to krok do celu!",
	"Dzisiaj budujesz siłę na jutro!",
	"Nie poddawaj się, Stefan!",
	"Jesteś silniejszy niż myślisz!",
	"100 pompek? Dasz radę!",
	"Cel jest w zasięgu ręki!",
	"Twoja determinacja jest inspirująca!",
	"Ruszamy po rekord!",
];

function getMotivationalMessage(): string {
	const index = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
	return MOTIVATIONAL_MESSAGES[index] ?? MOTIVATIONAL_MESSAGES[0] ?? "";
}

export function HomeScreen({ data, onStartWorkout }: HomeScreenProps) {
	const level = data.level as 1 | 2 | 3 | 4 | 5;
	const workout = getWorkout(level, data.currentWeek, data.currentDay);
	const targetReps = workout ? getTargetReps(workout) : 0;

	// Check if last workout was done today
	const lastWorkout = data.workouts[data.workouts.length - 1];
	const completedToday =
		lastWorkout && isSameDay(new Date(lastWorkout.date), new Date());

	// Check if program is complete (after week 6, day 3)
	const programComplete = data.currentWeek > 6;

	// Get current week attempt number
	const currentAttempt = data.weekAttempts[data.currentWeek] ?? 1;

	return (
		<div class="screen home-screen">
			<p class="greeting">
				Cześć, <span class="greeting-name">Stefan</span>! 💪
			</p>
			<h1>100 Pompek</h1>
			<p class="level-info">Poziom {data.level}</p>
			{programComplete ? (
				<div class="program-complete">
					<p class="week-info">Program ukończony!</p>
					<p>Gratulacje! Ukończyłeś 6-tygodniowy program.</p>
				</div>
			) : (
				<>
					<p class="week-info">
						Tydzień {data.currentWeek}
						{currentAttempt > 1 && ` - Próba ${currentAttempt}`}, Dzień{" "}
						{data.currentDay} z 3
					</p>
					{completedToday ? (
						<div class="workout-done-today success-glow">
							<p>Dzisiejszy trening ukończony! 🎉</p>
							<p class="next-workout-hint">
								Świetna robota, Stefan! Odpoczywaj do następnego treningu.
							</p>
						</div>
					) : (
						workout && (
							<>
								<div class="motivational-message">
									<p class="message-text">{getMotivationalMessage()}</p>
								</div>
								<div class="workout-preview">
									<p>Następny trening:</p>
									<p>
										{workout.sets.length} serii, cel: {targetReps}+ powtórzeń
									</p>
									<button
										type="button"
										class="btn-primary"
										onClick={onStartWorkout}
									>
										Rozpocznij trening
									</button>
								</div>
							</>
						)
					)}
				</>
			)}
		</div>
	);
}
