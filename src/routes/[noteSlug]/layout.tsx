import { format } from "date-fns";
import { NavLink, Outlet } from "solid-app-router";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { IndexeddbPersistence } from "y-indexeddb";
import { NoteMetaObject, notesMeta, rootDoc } from "./ydoc";

const NoteSlugLayout = () => {
  const [notes, setNotes] = createSignal<NoteMetaObject[]>([]);
  const [synced, setSynced] = createSignal(false);

  const rootProvider = new IndexeddbPersistence("rootDoc", rootDoc);

  performance.now();
  rootProvider.on("synced", () => {
    console.log(`synced after ${performance.now()}ms`);
    setSynced(true);
  });

  onCleanup(() => {
    rootProvider.destroy();
  });

  function handleObserve() {
    const sorted = [...notesMeta.values()].sort((a, b) =>
      a.updatedAt < b.updatedAt ? 1 : -1
    );
    setNotes(sorted);
  }

  onMount(() => {
    notesMeta.observeDeep(handleObserve);
    onCleanup(() => {
      notesMeta.unobserveDeep(handleObserve);
    });
  });

  return (
    <div
      class="flex h-screen overflow-hidden"
      classList={{
        invisible: !synced(),
      }}
    >
      <ul class="w-70 shrink-0 h-full px-2 py-4">
        <For each={notes()}>
          {(note, i) => {
            return (
              <li>
                <NavLink
                  href={note.slug}
                  activeClass="bg-neutral-200"
                  class="px-5 py-3 block rounded-lg cursor-default"
                  draggable={false}
                  end
                >
                  <div class="font-bold text-neutral-800 text-sm">
                    {note.title}
                  </div>
                  <div class="text-xs mt-1">
                    <span class="text-neutral-800">
                      {format(new Date(note.updatedAt), "p")}
                    </span>
                    <span class="font-medium text-neutral-500 ml-2">
                      {note.slug}
                    </span>
                  </div>
                </NavLink>
                <Show when={i() < notes().length - 1}>
                  <hr class="mx-8 text-neutral-200 -my-px" />
                </Show>
              </li>
            );
          }}
        </For>
        {/* <button class="mt-5" onClick={() => rootProvider.clearData()}>
          destroy
        </button> */}
      </ul>
      <div class="px-1.5 -mx-1.5 flex items-center cursor-ew-resize isolate z-10 pointer-events-none">
        <div class="h-full w-px bg-neutral-200"></div>
      </div>
      <Outlet />
    </div>
  );
};
export default NoteSlugLayout;
