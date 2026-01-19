import { render } from "preact";
import { App } from "./App.tsx";
import "./styles.css";

const container = document.getElementById("app");

if (container) {
	render(<App />, container);
}

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("/service-worker.js");
}
