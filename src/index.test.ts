import { describe, expect, it } from "bun:test";

describe("index.html", () => {
	it("should link to styles.css", async () => {
		const html = await Bun.file("./index.html").text();
		expect(html).toContain('<link rel="stylesheet" href="./src/styles.css">');
	});

	it("should have dark theme color meta tag", async () => {
		const html = await Bun.file("./index.html").text();
		expect(html).toContain('<meta name="theme-color" content="#050508">');
	});
});
