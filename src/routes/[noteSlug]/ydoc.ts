import * as Y from "yjs";

export const rootDoc = new Y.Doc();
export const notesData = rootDoc.getMap<Y.Doc>("notes");

export type NoteMeta = {
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export const notesMeta = rootDoc.getMap<NoteMeta>("notesMeta");
