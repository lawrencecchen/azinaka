import * as Y from "yjs";

export type NoteMetaObject = {
  title: string;
  subtitle: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export const rootDoc = new Y.Doc();
export const notesMetaMap = rootDoc.getMap<NoteMetaObject>("meta");
