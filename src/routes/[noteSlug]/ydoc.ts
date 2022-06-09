import * as Y from "yjs";

export type NoteMetaObject = {
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export const rootDoc = new Y.Doc();
export const notesMeta = rootDoc.getMap<NoteMetaObject>("meta");
