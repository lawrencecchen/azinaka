import { createStorageSignal } from "@solid-primitives/storage";
import { format } from "date-fns";
import { generateSlug } from "random-word-slugs";
import {
  NavLink,
  Outlet,
  useIsRouting,
  useLocation,
  useNavigate,
  useSearchParams,
} from "solid-app-router";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  JSX,
  onCleanup,
  Show,
} from "solid-js";
import { uid } from "uid";
import { IndexeddbPersistence } from "y-indexeddb";
import { useObserveDeep } from "../../lib/yjs/useObserveDeep";
import { useSynced } from "../../lib/yjs/useSynced";
import { showSideBar } from "./store";
import { NoteObject, notesMap, rootDoc } from "./ydoc";
import lunr from "lunr";
import Fuse from "fuse.js";

const NoteSlugLayout = () => {
  const [userId] = createStorageSignal("userId", uid(50));
  const rootProvider = new IndexeddbPersistence(userId(), rootDoc);
  const synced = useSynced(rootProvider, { showDebug: true });
  const location = useLocation();

  // const webrtcProvider = new WebrtcProvider(userId(), rootDoc, {
  //   signaling: ["wss://server.saltyrtc.org:443"],
  // });
  const notesMeta = useObserveDeep(
    notesMap,
    (map) => [...map.values()] as NoteObject[]
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

  type FuseType = { slug: string; content: string; title: string };
  const [searchIndex, setSearchIndex] = createSignal<Fuse<FuseType>>();
  const [searchResults, setSearchResults] =
    createSignal<Fuse.FuseResult<FuseType>[]>();
  // const [searchIndex, setSearchIndex] = createSignal<lunr.Index>();

  createEffect(() => {
    if (synced()) {
      performance.now();
      const records = [];
      for (const note of notes()) {
        const noteData = rootDoc
          .getXmlFragment(note.slug)
          .toArray()
          .map((e) => e.toDOM().textContent)
          .join(" ");
        const record = {
          slug: note.slug,
          content: noteData,
          title: note.title,
        };
        records.push(record);
      }
      const idx = new Fuse(records, {
        keys: ["content", "title"],
        ignoreFieldNorm: true,
        includeMatches: true,
        threshold: 0.4,
      });
      setSearchIndex(idx);
      console.log(`Indexed ${notes().length} notes in ${performance.now()} ms`);
    }
  });

  createEffect(() => {
    if (synced() && location.pathname === "/notes" && notes().length > 0) {
      navigate(`/notes/${notes()[0].slug}`);
    }
  });

  onCleanup(() => {
    rootProvider.destroy();
  });
  const navigate = useNavigate();
  const [selection, setSelection] = createSignal({ start: 0, end: 0 });
  const noteSlug = () => location.pathname.split("/").pop();
  createEffect(() => {
    if (synced() && (notes() || searchResults())) {
      if (searchResults()) {
        const noteIndex = searchResults().findIndex(
          (note) => note.item.slug === noteSlug()
        );
        if (noteIndex !== -1) {
          setSelection({ start: noteIndex, end: noteIndex });
        } else {
          setSelection({ start: 0, end: 0 });
        }
      } else {
        const noteIndex = notes().findIndex((note) => note.slug === noteSlug());
        if (noteIndex !== -1) {
          setSelection({ start: noteIndex, end: noteIndex });
        }
      }
    }
  });

  function handleDelete() {
    const index = notes().findIndex((n) => n.slug === noteSlug());
    notesMap.set(noteSlug(), {
      ...notesMap.get(noteSlug()),
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
  const [searchParams, setSearchParams] = useSearchParams();

  function handleInput(
    e: InputEvent & { currentTarget: HTMLInputElement; target: Element }
  ) {
    const value = e.currentTarget.value;
    setSearchParams(
      { q: value },
      {
        replace: true,
      }
    );
    if (value && searchIndex()) {
      const results = searchIndex().search(value);
      setSearchResults(results);
      const hit = results?.[0];
      if (hit) {
        navigate(`/notes/${hit.item.slug}`);
      }
    } else if (!value) {
      setSearchResults(null);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      setSearchResults(null);
    } else if (e.key === "ArrowUp") {
      if (selection().start > 0) {
        setSelection({
          start: selection().start - 1,
          end: selection().end - 1,
        });
      }
    } else if (e.key === "ArrowDown") {
      if (selection().start < searchResults()?.length - 1) {
        setSelection({
          start: selection().start + 1,
          end: selection().end + 1,
        });
      }
    }
    const selected = searchResults()?.[selection().start];
    if (selected) {
      navigate(`/notes/${selected.item.slug}`);
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
          <input
            type="text"
            class="px-3 py-0.5 text-neutral-700 border rounded border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition"
            placeholder="Search"
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            // value={searchParams.q}
          />
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

        <Show when={!searchResults()}>
          <ul class="p-2 overflow-auto grow pb-4 min-h-0">
            <For each={notes()}>
              {(note, i) => {
                return (
                  <li>
                    <NavLink
                      href={note.slug}
                      activeClass="bg-neutral-200"
                      class="px-5 py-3 block rounded-lg cursor-default select-none"
                      classList={{
                        "bg-neutral-200 heyo":
                          i() >= selection().start && i() <= selection().end,
                      }}
                      draggable={false}
                      end
                      // onClick={handleNavigate}
                    >
                      <div class="font-bold text-neutral-800 text-sm whitespace-nowrap text-ellipsis overflow-hidden">
                        {note.title}{" "}
                        {/* {i() >= selection().start && i() <= selection().end
                          ? "yes"
                          : "no"} */}
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
        </Show>
        <Show when={searchResults()}>
          <div class="border-b border-neutral-200 text-xs font-bold px-3 py-1 text-neutral-500">
            Search results
          </div>
          <Show
            when={searchResults().length > 0}
            fallback={
              <div class="p-4 text-sm text-neutral-600">
                Couldn't find anything
              </div>
            }
          >
            <ul class="p-2 overflow-auto grow pb-4 min-h-0">
              <For each={searchResults()}>
                {(result, i) => {
                  return (
                    <li>
                      <NavLink
                        href={result.item.slug}
                        activeClass="bg-neutral-200"
                        class="px-5 py-3 block rounded-lg cursor-default select-none"
                        draggable={false}
                        end
                      >
                        <div class="font-bold text-neutral-800 text-sm whitespace-nowrap text-ellipsis overflow-hidden">
                          {result.item.title}
                        </div>
                        <div class="text-xs mt-1 whitespace-nowrap text-ellipsis overflow-hidden">
                          <span class="font-medium text-neutral-500">
                            {result.item.content}
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
          </Show>
        </Show>
        {/* <button class="mt-5" onClick={() => rootProvider.clearData()}>
          destroy
        </button> */}
      </div>
      <div class="px-1.5 -mx-1.5 flex items-center cursor-ew-resize isolate z-10 pointer-events-none">
        <div class="h-full w-px bg-neutral-200"></div>
      </div>

      <Show when={synced()}>
        <Outlet />
      </Show>
    </div>
  );
};
export default NoteSlugLayout;
