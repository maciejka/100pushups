// Production build script

import { cp, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";

const DIST_DIR = "./dist";

async function build() {
	// Clean and create dist directory
	await mkdir(DIST_DIR, { recursive: true });

	// Bundle TypeScript/JSX
	const result = await Bun.build({
		entrypoints: ["./src/main.tsx"],
		outdir: DIST_DIR,
		target: "browser",
		minify: true,
	});

	if (!result.success) {
		console.error("Build failed:", result.logs);
		process.exit(1);
	}

	// Copy static files
	await cp("./index.html", join(DIST_DIR, "index.html"));

	// Copy public directory contents
	const publicFiles = await readdir("./public");
	for (const file of publicFiles) {
		await cp(join("./public", file), join(DIST_DIR, file));
	}

	// Copy CSS
	await cp("./src/styles.css", join(DIST_DIR, "main.css"));

	// Update index.html to reference built JS and CSS
	const indexPath = join(DIST_DIR, "index.html");
	let html = await Bun.file(indexPath).text();
	html = html.replace("./src/main.tsx", "./main.js");
	html = html.replace("./src/styles.css", "./main.css");
	await Bun.write(indexPath, html);

	console.log("Build complete! Output in ./dist");
}

build();
