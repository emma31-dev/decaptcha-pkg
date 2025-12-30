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

	// Visible debug banner so we can see whether the client bundle executed
	let debugBanner = document.getElementById("debug-banner");
	if (!debugBanner) {
		debugBanner = document.createElement("div");
		debugBanner.id = "debug-banner";
		debugBanner.style.position = "fixed";
		debugBanner.style.left = "12px";
		debugBanner.style.top = "12px";
		debugBanner.style.zIndex = "999999";
		debugBanner.style.padding = "6px 10px";
		debugBanner.style.background = "rgba(220,38,38,0.95)"; // red
		debugBanner.style.color = "white";
		debugBanner.style.fontWeight = "700";
		debugBanner.style.borderRadius = "6px";
		debugBanner.style.fontFamily = "sans-serif";
		debugBanner.innerText = "App: mounting...";
		document.body.appendChild(debugBanner);
	} else {
		debugBanner.innerText = "App: mounting...";
	}

	// Attempt to render the app; if it throws, the catch block updates the banner
	createRoot(container).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>
	);

	// If render succeeded, update the banner
	if (debugBanner) debugBanner.innerText = "App: mounted";
} catch (err) {
	// Friendly runtime error so dev server shows console output
	// eslint-disable-next-line no-console
	console.error("Failed to mount React app:", err);
	const banner = document.getElementById("debug-banner");
	if (banner) banner.innerText = `App: mount failed — see console`;
	throw err;
}
