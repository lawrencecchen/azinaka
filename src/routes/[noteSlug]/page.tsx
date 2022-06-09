import { format } from "date-fns";
import { baseKeymap, toggleMark } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Link, useParams } from "solid-app-router";
import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";
import { redo, undo, ySyncPlugin, yUndoPlugin } from "y-prosemirror";
import { schema } from "./schema";
import "./styles.css";
import { notesMeta, rootDoc } from "./ydoc";

type EditorProps = {
  documentName: string;
};

const Editor = (props: EditorProps) => {
  let divRef: HTMLDivElement;
  let mounted = false;

  function handleObserve() {
    if (!mounted) {
      mounted = true;
      return;
    }
    notesMeta.set(props.documentName, {
      ...notesMeta.get(props.documentName),
      updatedAt: new Date().toString(),
    });
  }

  createEffect(() => {
    if (!notesMeta.has(props.documentName)) {
      notesMeta.set(props.documentName, {
        title: "New Note",
        slug: props.documentName,
        createdAt: new Date().toString(),
        updatedAt: new Date().toString(),
      });
    }

    const type = rootDoc.getXmlFragment(props.documentName);
    type.observeDeep(handleObserve);
    const prosemirrorView = new EditorView(divRef, {
      state: EditorState.create({
        schema: schema,
        plugins: [
          ySyncPlugin(type),
          // yCursorPlugin(provider.awareness),
          yUndoPlugin(),
          keymap({
            "Mod-z": undo,
            "Mod-y": redo,
            "Mod-Shift-z": redo,
            "Mod-b": toggleMark(schema.marks.strong),
            "Mod-i": toggleMark(schema.marks.em),
          }),
          keymap(baseKeymap),
        ], //.concat(exampleSetup({ schema })),
      }),
    });

    onCleanup(() => {
      prosemirrorView.destroy();
      type.unobserveDeep(handleObserve);
    });
  });

  return <div ref={divRef} class="grow flex flex-col w-full" />;
};

const NoteSlugRoute = () => {
  const params = useParams();
  const documentName = () => params.noteSlug;
  const [lastUpdated, setLastUpdated] = createSignal<Date>();
  function handleObserve() {
    const obj = notesMeta.get(documentName());
    if (obj) {
      setLastUpdated(new Date(obj.updatedAt));
    }
  }
  onMount(() => {
    notesMeta.observe(handleObserve);
    onCleanup(() => {
      notesMeta.unobserve(handleObserve);
    });
  });
  createEffect(() => {
    documentName() && handleObserve();
  });

  return (
    <div class="grow flex flex-col">
      <div class="flex py-2 px-5">
        <Link
          href="/notes/new"
          class="px-1.5 -ml-2 hover:bg-neutral-100 active:bg-neutral-100 transition rounded pb-1 cursor-default hover:active:bg-neutral-200 text-neutral-500 hover:active:text-neutral-700"
          draggable={false}
        >
          <span class="i-fluent-compose-16-filled text-lg "></span>
        </Link>
      </div>

      <div class="grow overflow-auto flex flex-col">
        <div class="text-neutral-500 text-sm text-center my-2">
          <Show when={lastUpdated()}>{format(lastUpdated(), "PPPp")}</Show>
        </div>
        <Editor documentName={documentName()} />
      </div>
    </div>
  );
};
export default NoteSlugRoute;
