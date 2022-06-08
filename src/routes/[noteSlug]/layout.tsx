import { format } from "date-fns";
import { NavLink, Outlet } from "solid-app-router";
import { createEffect, createSignal, For, onMount } from "solid-js";
import { IndexeddbPersistence } from "y-indexeddb";
import { NoteMeta, notesMeta, rootDoc } from "./ydoc";

const NoteSlugLayout = () => {
  const [notes, setNotes] = createSignal<NoteMeta[]>([]);

  onMount(() => {
    // const provider = new IndexeddbPersistence(`rootDoc`, rootDoc);
    // notesMeta.values
    notesMeta.observe(() => {
      const sorted = [...notesMeta.values()].sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1
      );
      setNotes(sorted);
    });

    // console.log(notes());
    return () => {
      // provider.destroy();
    };
  });

  createEffect(() => {
    console.log(notes());
  });

  return (
    <div class="flex h-screen overflow-hidden">
      <ul class="w-70 shrink-0 border-r h-full border-neutral-200 px-2 py-4">
        <For each={notes()}>
          {(note) => (
            <li class="mt-1">
              <NavLink
                href={note.slug}
                activeClass="bg-neutral-200"
                class="px-5 py-2 block rounded"
                end
              >
                <div class="font-bold text-neutral-800 text-sm">
                  {note.title}
                </div>
                <div class="text-xs mt-1">
                  <span class="text-neutral-800">
                    {format(new Date(note.createdAt), "p")}
                  </span>
                  <span class="font-medium text-neutral-500 ml-2">
                    {note.slug}
                  </span>
                </div>
              </NavLink>
            </li>
          )}
        </For>
      </ul>
      <Outlet />
    </div>
  );
};
export default NoteSlugLayout;
