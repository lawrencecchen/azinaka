import * as Y from "yjs";

export type NoteObject = {
  title: string;
  subtitle: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  // xmlFragment: Y.XmlFragment;
};

export const rootDoc = new Y.Doc();
export const notesMap = rootDoc.getMap<NoteObject>("meta");
