import { format } from "date-fns";
import { baseKeymap, toggleMark } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { EditorState, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { generateSlug } from "random-word-slugs";
import { Link, useParams, useSearchParams } from "solid-app-router";
import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  Show,
} from "solid-js";
import { redo, undo, ySyncPlugin, yUndoPlugin } from "y-prosemirror";
import { YXmlFragment } from "yjs/dist/src/internals";
import { useObserveDeep } from "../../lib/yjs/useObserveDeep";
import { schema } from "./schema";
import { setShowSideBar } from "./store";
import "./styles.css";
import { notesMap, rootDoc } from "./ydoc";

type EditorProps = {
  documentName: string;
};

const DEFAULT_TITLE = "New Note";
const DEFAULT_SUBTITLE = "No additional text";

const Editor = (props: EditorProps) => {
  let divRef: HTMLDivElement;
  let mounted = false;
  let [prosemirrorView, setProsemirrorView] = createSignal<EditorView>();
  const [searchParams, setSearchParams] = useSearchParams();

  function getMetadata() {
    const type = rootDoc.getXmlFragment(props.documentName);
    const title = type.get(0)?.toDOM().textContent;
    const subtitle = type.get(1)?.toDOM().textContent;

    return {
      title: title || subtitle || DEFAULT_TITLE,
      subtitle: (title && subtitle) || DEFAULT_SUBTITLE,
    };
  }

  function handleObserve() {
    if (!mounted) {
      mounted = true;
      return;
    }
    const { title, subtitle } = getMetadata();
    notesMap.set(props.documentName, {
      ...notesMap.get(props.documentName),
      updatedAt: new Date().toString(),
      title,
      subtitle,
    });
  }

  function createEditorState(
    yXmlFragment: YXmlFragment,
    options?: { shouldFocus?: boolean }
  ) {
    const view = prosemirrorView();
    const selection =
      options.shouldFocus && view
        ? TextSelection.create(view.state.tr.doc, 0)
        : null;
    return EditorState.create({
      schema: schema,
      selection,
      plugins: [
        ySyncPlugin(yXmlFragment),
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
    });
  }

  createEffect(() => {
    if (!notesMap.has(props.documentName)) {
      notesMap.set(props.documentName, {
        title: DEFAULT_TITLE,
        subtitle: DEFAULT_SUBTITLE,
        slug: props.documentName,
        createdAt: new Date().toString(),
        updatedAt: new Date().toString(),
      });
    }
    // const note = notesMap.get(props.documentName);
    // console.log(note);
    const type = rootDoc.getXmlFragment(props.documentName);
    // const type = note.xmlFragment; //getXmlFragment(props.documentName);
    type.observeDeep(handleObserve);
    if (prosemirrorView()) {
      prosemirrorView().updateState(
        createEditorState(type, { shouldFocus: !!searchParams.new })
      );
    } else {
      const view = new EditorView(divRef, {
        state: createEditorState(type, { shouldFocus: !!searchParams.new }),
      });
      setProsemirrorView(view);
    }

    setSearchParams(
      {
        new: null,
      },
      {
        replace: true,
      }
    );

    onCleanup(() => {
      type.unobserveDeep(handleObserve);
    });
  });
  // createEffect(() => {
  //   const view = prosemirrorView();

  //   if (view && searchParams.new) {
  //     console.log("HAR");
  //     view.dispatch(
  //       view.state.tr.setSelection(TextSelection.create(view.state.tr.doc, 0))
  //     );
  //     // view.focus();
  //     setSearchParams(
  //       {
  //         new: null,
  //       },
  //       {
  //         replace: true,
  //       }
  //     );
  //   }
  // });

  onCleanup(() => {
    prosemirrorView()?.destroy();
  });

  return <div ref={divRef} class="grow flex flex-col w-full" />;
};

const NoteSlugRoute = () => {
  const params = useParams();
  const documentName = () => params.noteSlug;
  const noteMeta = useObserveDeep(notesMap, (map) => map.get(documentName()));
  const lastUpdated = createMemo(
    () => noteMeta() && new Date(noteMeta().updatedAt)
  );

  return (
    <div class="grow flex flex-col min-w-screen sm:min-w-auto w-full">
      <div class="flex py-2 px-5">
        <button
          type="button"
          class="px-1.5 -ml-2 hover:bg-neutral-100 mr-3 sm:hidden active:bg-neutral-100 transition rounded pb-1 cursor-default hover:active:bg-neutral-200 text-neutral-500 hover:active:text-neutral-700"
          aria-label="Open menu"
          onClick={() => setShowSideBar((s) => !s)}
        >
          <span class="i-material-symbols-menu-rounded text-lg"></span>
        </button>
        <Link
          href={`/notes/${generateSlug()}?new=true`}
          class="px-1.5 -ml-2 hover:bg-neutral-100 active:bg-neutral-100 transition rounded pb-1 cursor-default hover:active:bg-neutral-200 text-neutral-500 hover:active:text-neutral-700"
          draggable={false}
          aria-label="New note"
        >
          <span class="i-fluent-compose-16-filled text-lg"></span>
        </Link>
      </div>

      <div class="grow overflow-auto flex flex-col prose min-w-full">
        <div class="text-neutral-500 text-sm text-center my-2 not-prose tabular-nums">
          <Show when={lastUpdated()}>{format(lastUpdated(), "PPPp")}</Show>
        </div>
        <Editor documentName={documentName()} />
      </div>
    </div>
  );
};
export default NoteSlugRoute;
