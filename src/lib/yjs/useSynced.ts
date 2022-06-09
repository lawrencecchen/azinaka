import { Observable } from "lib0/observable.js";
import { createSignal } from "solid-js";

export function useSynced<T extends Observable<string>>(
  provider: T,
  options?: {
    showDebug?: boolean;
  }
) {
  const [synced, setSynced] = createSignal(false);
  options.showDebug && performance.now();
  provider.on("synced", () => {
    options.showDebug &&
      console.log(`indexeddb: synced after ${performance.now()} ms`);
    setSynced(true);
  });
  return synced;
}
