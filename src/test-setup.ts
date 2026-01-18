import { Window } from "happy-dom";
import "fake-indexeddb/auto";

const window = new Window({ url: "http://localhost:3000" });

Object.assign(globalThis, {
	window,
	document: window.document,
	navigator: window.navigator,
	HTMLElement: window.HTMLElement,
	Element: window.Element,
	Node: window.Node,
	Text: window.Text,
	DocumentFragment: window.DocumentFragment,
});
