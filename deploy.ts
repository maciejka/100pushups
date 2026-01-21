// Deploy to GitHub Pages
import { rm } from "node:fs/promises";
import { $ } from "bun";

const DIST_DIR = "./dist";
const REPO = "https://github.com/maciejka/100pushups.git";

async function deploy() {
	// Build first
	console.log("Building...");
	await $`bun run build`;

	// Deploy to gh-pages
	console.log("Deploying to GitHub Pages...");
	$.cwd(DIST_DIR);
	await $`git init`;
	await $`git add .`;
	await $`git commit -m "Deploy to GitHub Pages"`;
	await $`git branch -M gh-pages`;
	await $`git remote add origin ${REPO}`;
	await $`git push -f origin gh-pages`;

	// Cleanup
	await rm(`${DIST_DIR}/.git`, { recursive: true });

	console.log("Deployed! https://maciejka.github.io/100pushups/");
}

deploy();
