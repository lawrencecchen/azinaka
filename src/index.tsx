import "uno.css";
import "@unocss/reset/tailwind.css";
import { render } from "solid-js/web";
import App from "./App";
import { Router } from "solid-app-router";

import { registerSW } from "virtual:pwa-register";
import ReloadPrompt from "./lib/components/ServiceWorkers/ReloadPrompt";

const intervalMS = 60 * 60 * 1000;

const updateSW = registerSW({
  onRegistered(r) {
    r &&
      setInterval(() => {
        r.update();
      }, intervalMS);
  },
});
render(
  () => (
    <>
      <Router>
        <App />
      </Router>
      <ReloadPrompt />
    </>
  ),
  document.getElementById("root") as HTMLElement
);
