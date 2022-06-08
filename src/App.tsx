import { Navigate, Route, Routes } from "solid-app-router";
import type { Component } from "solid-js";
import IndexRoute from "./routes/Index/page";
import { generateSlug } from "random-word-slugs";
import NoteSlugRoute from "./routes/[noteSlug]/page";
import NoteSlugLayout from "./routes/[noteSlug]/layout";

const App: Component = () => {
  return (
    <Routes>
      <Route path="/notes" element={<NoteSlugLayout />}>
        <Route path="/" element={<IndexRoute />} />
        <Route path="/:noteSlug" element={<NoteSlugRoute />} />
      </Route>
      <Route path="/" element={<IndexRoute />} />
      <Route
        path="/notes/new"
        element={<Navigate href={`/notes/${generateSlug()}`} />}
      />
    </Routes>
  );
};

export default App;
