interface AppHeaderProps {
	level?: number | null;
	week?: number;
	day?: number;
	currentSet?: number;
	totalSets?: number;
}

export function AppHeader({
	level,
	week,
	day,
	currentSet,
	totalSets,
}: AppHeaderProps) {
	const showProgress = week !== undefined && day !== undefined;
	const showSet = currentSet !== undefined && totalSets !== undefined;

	return (
		<div class="app-header">
			<h1>100p</h1>
			<div class="header-info">
				{level && <span class="level-badge">P{level}</span>}
				{showProgress && (
					<span class="progress-info">
						T: {week}/6, D: {day}/3
						{showSet && `, S: ${currentSet + 1}/${totalSets}`}
					</span>
				)}
			</div>
		</div>
	);
}
