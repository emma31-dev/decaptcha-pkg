import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

try {
	console.log("main.tsx: starting app mount");

	let container = document.getElementById("root");

	if (!container) {
		console.warn("main.tsx: #root not found — creating fallback root element");
		container = document.createElement("div");
		container.id = "root";
		document.body.appendChild(container);
	}

	// Debug banner removed for production

	// Attempt to render the app; if it throws, the catch block updates the banner
	createRoot(container).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>
	);

	// App mounted successfully
} catch (err) {
	// Friendly runtime error so dev server shows console output
	// eslint-disable-next-line no-console
	console.error("Failed to mount React app:", err);
	// App mount failed - check console for details
	throw err;
}
