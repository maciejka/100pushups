import type { UserData } from "../stores/db.ts";

interface SettingsScreenProps {
	data: UserData;
}

export function SettingsScreen({ data }: SettingsScreenProps) {
	return (
		<div class="screen settings-screen">
			<h1>Ustawienia</h1>
			<div class="setting-item">
				<span>Aktualny poziom:</span>
				<span>{data.level}</span>
			</div>
			<div class="setting-item">
				<span>Wynik testu:</span>
				<span>{data.testResult} pompek</span>
			</div>
		</div>
	);
}
