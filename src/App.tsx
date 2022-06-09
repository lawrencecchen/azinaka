import { Navigate, Route, Routes } from "solid-app-router";
import type { Component } from "solid-js";
import IndexRoute from "./routes/Index/page";
import { generateSlug } from "random-word-slugs";
import NoteSlugRoute from "./routes/[noteSlug]/page";
import NoteSlugLayout from "./routes/[noteSlug]/layout";
import { createStorageSignal } from "@solid-primitives/storage";
import NoteSlugIndex from "./routes/[noteSlug]";

const App: Component = () => {
  return (
    <Routes>
      <Route path="/notes" element={<NoteSlugLayout />}>
        <Route path="/" element={<NoteSlugIndex />} />
        <Route path="/:noteSlug" element={<NoteSlugRoute />} />
      </Route>
      <Route path="/" element={<IndexRoute />} />
      <Route
        path="/notes/new"
        element={<Navigate href={`/notes/${generateSlug()}?new=true`} />}
      />
    </Routes>
  );
};

export default App;
