import { createStorageSignal } from "@solid-primitives/storage";
import { format } from "date-fns";
import { generateSlug } from "random-word-slugs";
import {
  NavLink,
  Outlet,
  useIsRouting,
  useLocation,
  useNavigate,
} from "solid-app-router";
import { createEffect, createMemo, For, onCleanup, Show } from "solid-js";
import { uid } from "uid";
import { IndexeddbPersistence } from "y-indexeddb";
import { useObserveDeep } from "../../lib/yjs/useObserveDeep";
import { useSynced } from "../../lib/yjs/useSynced";
import { showSideBar } from "./store";
import { NoteMetaObject, notesMetaMap, rootDoc } from "./ydoc";

const NoteSlugLayout = () => {
  const [userId] = createStorageSignal("userId", uid(50));
  const rootProvider = new IndexeddbPersistence(userId(), rootDoc);
  const synced = useSynced(rootProvider, { showDebug: true });
  const location = useLocation();

  // const webrtcProvider = new WebrtcProvider(userId(), rootDoc, {
  //   signaling: ["wss://server.saltyrtc.org:443"],
  // });
  const notesMeta = useObserveDeep(
    notesMetaMap,
    (map) => [...map.values()] as NoteMetaObject[]
  );
  const notes = createMemo(() =>
    notesMeta()
      .filter((n) => !n.deletedAt)
      .sort((a, b) =>
        new Date(a.updatedAt).getTime() < new Date(b.updatedAt).getTime()
          ? 1
          : -1
      )
  );

  createEffect(() => {
    if (synced() && location.pathname === "/notes" && notes().length > 0) {
      navigate(`/notes/${notes()[0].slug}`);
    }
  });

  onCleanup(() => {
    rootProvider.destroy();
  });
  const navigate = useNavigate();

  function handleDelete() {
    const noteSlug = location.pathname.split("/").pop();
    const index = notes().findIndex((n) => n.slug === noteSlug);
    notesMetaMap.set(noteSlug, {
      ...notesMetaMap.get(noteSlug),
      deletedAt: new Date().toString(),
    });

    if (index < notes().length) {
      navigate(`/notes/${notes()[index].slug}`);
    } else if (index > 0) {
      navigate(`/notes/${notes()[index - 1].slug}`);
    } else {
      navigate(`/notes/${notes()[0].slug}`);
    }
  }

  return (
    <div
      class="flex h-screen w-screen overflow-hidden"
      classList={{
        invisible: !synced(),
      }}
    >
      <div
        class="w-70 shrink-0 h-screen flex-col sm:flex"
        classList={{
          hidden: !showSideBar(),
          flex: showSideBar(),
        }}
      >
        <div class="flex py-2 px-5">
          <div class="ml-auto mr-0">
            <button
              onClick={handleDelete}
              type="button"
              class="px-1.5 -ml-2 hover:bg-neutral-100 active:bg-neutral-100 transition rounded pb-1 cursor-default hover:active:bg-neutral-200 text-neutral-500 hover:active:text-neutral-700"
            >
              <div class="i-material-symbols-delete-outline-rounded text-lg" />
            </button>
          </div>
        </div>

        <ul class="p-2 overflow-auto grow pb-4 min-h-0">
          <For each={notes()}>
            {(note, i) => {
              return (
                <li>
                  <NavLink
                    href={note.slug}
                    activeClass="bg-neutral-200"
                    class="px-5 py-3 block rounded-lg cursor-default select-none"
                    draggable={false}
                    end
                    // onClick={handleNavigate}
                  >
                    <div class="font-bold text-neutral-800 text-sm whitespace-nowrap text-ellipsis overflow-hidden">
                      {note.title}
                    </div>
                    <div class="text-xs mt-1 whitespace-nowrap text-ellipsis overflow-hidden">
                      <span class="text-neutral-800">
                        {format(new Date(note.updatedAt), "p")}
                      </span>
                      <span class="font-medium text-neutral-500 ml-2">
                        {note.subtitle}
                      </span>
                    </div>
                  </NavLink>
                  <Show when={i() < notes().length - 1}>
                    <hr class="ml-5 mr-2 text-neutral-200 -my-px" />
                  </Show>
                </li>
              );
            }}
          </For>
        </ul>
        {/* <button class="mt-5" onClick={() => rootProvider.clearData()}>
          destroy
        </button> */}
      </div>
      <div class="px-1.5 -mx-1.5 flex items-center cursor-ew-resize isolate z-10 pointer-events-none">
        <div class="h-full w-px bg-neutral-200"></div>
      </div>
      <Outlet />
    </div>
  );
};
export default NoteSlugLayout;
