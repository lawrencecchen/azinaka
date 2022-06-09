import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { AbstractType } from "yjs";

export function useObserveDeep<T extends AbstractType<any>, U>(
  type: T,
  accessor: (type: T) => U
) {
  const [value, setValue] = createSignal<U>(accessor(type));

  function handleObserve() {
    setValue(() => accessor(type));
  }

  createEffect(() => {
    setValue(() => accessor(type));
  });

  onMount(() => {
    type.observeDeep(handleObserve);
    onCleanup(() => {
      type.unobserveDeep(handleObserve);
    });
  });
  return value;
}
