import type { Route } from "../hooks/useRouter.ts";

interface BottomNavProps {
	route: Route;
	onNavigate: (route: Route) => void;
}

export function BottomNav({ route, onNavigate }: BottomNavProps) {
	return (
		<nav class="bottom-nav">
			<button
				type="button"
				class={route === "home" ? "active" : ""}
				onClick={() => onNavigate("home")}
			>
				Start
			</button>
			<button
				type="button"
				class={route === "progress" ? "active" : ""}
				onClick={() => onNavigate("progress")}
			>
				Postępy
			</button>
			<button
				type="button"
				class={route === "settings" ? "active" : ""}
				onClick={() => onNavigate("settings")}
			>
				Ustawienia
			</button>
		</nav>
	);
}
