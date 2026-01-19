import { getTargetReps, getWorkout } from "../data/program.ts";
import type { UserData } from "../stores/db.ts";

interface HomeScreenProps {
	data: UserData;
	onStartWorkout: () => void;
}

export function HomeScreen({ data, onStartWorkout }: HomeScreenProps) {
	const level = data.level as 1 | 2 | 3 | 4 | 5;
	const workout = getWorkout(level, data.currentWeek, data.currentDay);
	const targetReps = workout ? getTargetReps(workout) : 0;

	return (
		<div class="screen home-screen">
			<h1>100 Pompek</h1>
			<p class="level-info">Poziom: {data.level}</p>
			<p class="week-info">
				Tydzień {data.currentWeek}, Dzień {data.currentDay}
			</p>
			{workout && (
				<div class="workout-preview">
					<p>Następny trening:</p>
					<p>
						{workout.sets.length} serii, cel: {targetReps}+ powtórzeń
					</p>
					<button type="button" class="btn-primary" onClick={onStartWorkout}>
						Rozpocznij trening
					</button>
				</div>
			)}
		</div>
	);
}
