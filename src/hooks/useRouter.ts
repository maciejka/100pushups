import { useCallback, useEffect, useState } from "preact/hooks";

export type Route = "home" | "progress" | "settings";

export function useRouter(): {
	route: Route;
	navigate: (route: Route) => void;
} {
	const getRouteFromHash = (): Route => {
		const hash = window.location.hash.slice(1);
		if (hash === "progress" || hash === "settings") {
			return hash;
		}
		return "home";
	};

	const [route, setRoute] = useState<Route>(getRouteFromHash);

	const navigate = useCallback((newRoute: Route) => {
		window.location.hash = newRoute === "home" ? "" : newRoute;
	}, []);

	useEffect(() => {
		const handleHashChange = () => {
			setRoute(getRouteFromHash());
		};

		window.addEventListener("hashchange", handleHashChange);
		return () => window.removeEventListener("hashchange", handleHashChange);
	}, []);

	return { route, navigate };
}
