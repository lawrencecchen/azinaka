import { generateSlug } from "random-word-slugs";
import { Navigate, Route, Routes } from "solid-app-router";
import type { Component } from "solid-js";
import IndexRoute from "./routes/Index/page";
import NoteSlugIndex from "./routes/[noteSlug]";
import NoteSlugLayout from "./routes/[noteSlug]/layout";
import NoteSlugRoute from "./routes/[noteSlug]/page";

const App: Component = () => {
  return (
    <Routes>
      <Route path="/notes" element={<NoteSlugLayout />}>
        <Route path="/" element={<IndexRoute />} />
        <Route path="/:noteSlug" element={<NoteSlugRoute />} />
      </Route>
      <Route path="/" element={<Navigate href="/notes" />} />
      <Route
        path="/notes/new"
        element={<Navigate href={`/notes/${generateSlug()}?new=true`} />}
      />
    </Routes>
  );
};

export default App;
