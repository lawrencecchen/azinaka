import { Link } from "solid-app-router";

const IndexRoute = () => {
  return (
    <div class="max-w-3xl p-4 mx-auto py-20">
      <h1 class="text-3xl font-bold">Azinaka</h1>

      <p class="my-4">Browser based Notes that syncs with git.</p>

      <div class="my-8">
        <Link
          href="/notes/new"
          class="px-3 py-2 font-bold rounded bg-black text-white hover:bg-white hover:text-black border-black border transition text-sm hover:active:bg-neutral-100"
        >
          Create a note
        </Link>
      </div>
    </div>
  );
};
export default IndexRoute;
