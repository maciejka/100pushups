import { render } from "preact";
import { App } from "./App.tsx";

const container = document.getElementById("app");

if (container) {
	render(<App />, container);
}

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("/service-worker.js");
}
