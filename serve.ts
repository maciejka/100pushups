// Development server using Bun

const server = Bun.serve({
	port: 3000,
	async fetch(req) {
		const url = new URL(req.url);
		let path = url.pathname;

		// Default to index.html
		if (path === "/") {
			path = "/index.html";
		}

		// Try to serve from public directory first
		let file = Bun.file(`./public${path}`);
		if (await file.exists()) {
			return new Response(file);
		}

		// Try root directory (for index.html)
		file = Bun.file(`.${path}`);
		if (await file.exists()) {
			// Handle TypeScript/TSX files - bundle on the fly
			if (path.endsWith(".ts") || path.endsWith(".tsx")) {
				const result = await Bun.build({
					entrypoints: [`.${path}`],
					target: "browser",
					define: {
						__DEPLOY_DATE__: JSON.stringify(new Date().toISOString()),
					},
				});
				if (result.outputs[0]) {
					return new Response(result.outputs[0], {
						headers: { "Content-Type": "application/javascript" },
					});
				}
			}
			return new Response(file);
		}

		return new Response("Not Found", { status: 404 });
	},
});

console.log(`Server running at http://localhost:${server.port}`);
