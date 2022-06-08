import { Link, useNavigate, useParams } from "solid-app-router";
import { createEffect, onMount } from "solid-js";
import * as Y from "yjs";
import {
  ySyncPlugin,
  yCursorPlugin,
  yUndoPlugin,
  undo,
  redo,
} from "y-prosemirror";
import { EditorState } from "prosemirror-state";
import { schema } from "./schema";
import { EditorView } from "prosemirror-view";
import { IndexeddbPersistence } from "y-indexeddb";
import { keymap } from "prosemirror-keymap";
import { exampleSetup } from "prosemirror-example-setup";
import "./styles.css";
import { format } from "date-fns";
import { notesMeta, rootDoc, notesData } from "./ydoc";
import { baseKeymap } from "prosemirror-commands";

type EditorProps = {
  documentName: string;
};

const Editor = (props: EditorProps) => {
  let divRef: HTMLDivElement;

  createEffect(() => {
    if (!notesData.has(props.documentName)) {
      rootDoc.transact(() => {
        notesData.set(props.documentName, new Y.Doc());
        notesMeta.set(props.documentName, {
          createdAt: new Date().toString(),
          updatedAt: new Date().toString(),
          slug: props.documentName,
          title: "New Note",
        });
      });
    }
    const subDoc = notesData.get(props.documentName);
    const provider = new IndexeddbPersistence(props.documentName, subDoc);
    const type = subDoc.getXmlFragment("prosemirror");
    const prosemirrorView = new EditorView(divRef, {
      state: EditorState.create({
        schema,
        plugins: [
          ySyncPlugin(type),
          // yCursorPlugin(provider.awareness),
          yUndoPlugin(),
          keymap({
            ...baseKeymap,
            "Mod-z": undo,
            "Mod-y": redo,
            "Mod-Shift-z": redo,
          }),
        ],
        // .concat(exampleSetup({ schema })),
      }),
    });

    return () => {
      provider.destroy();
      prosemirrorView.destroy();
      // subDoc.destroy();
    };
  });

  return <div ref={divRef} class="grow flex flex-col w-full" />;
};

const NoteSlugRoute = () => {
  const params = useParams();
  const lastUpdated = new Date();

  return (
    <div class="grow flex flex-col">
      <div class="flex py-2 px-5 bg-white/80 backdrop-blur-2xl">
        <Link
          href="/notes/new"
          class="px-1.5 -ml-2 hover:bg-neutral-100 transition rounded pb-1 cursor-default active:bg-neutral-200"
          draggable={false}
        >
          <span class="i-fluent-compose-16-filled text-lg text-neutral-500"></span>
        </Link>
      </div>

      <div class="grow overflow-auto flex flex-col">
        <div class="text-neutral-500 text-sm text-center my-2">
          {format(lastUpdated, "PPPp")}
        </div>
        <Editor documentName={params.noteSlug} />
      </div>
    </div>
  );
};
export default NoteSlugRoute;
