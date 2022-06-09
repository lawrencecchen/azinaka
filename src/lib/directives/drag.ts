import { onCleanup } from "solid-js";

export function drag(el, accessor) {
  let initialEvent;
  let immutableContainer: any;
  function mousemove(e) {
    const result = accessor?.()?.onDrag?.(e, initialEvent, immutableContainer);
    if (!immutableContainer) {
      immutableContainer = result;
    }
  }

  function mousedown(e) {
    initialEvent = e;
    accessor?.()?.onDragStart?.(e);
    document.body.style.userSelect = "none";
    document.body.style.cursor = accessor?.().cursorStyle ?? "ew-resize";
    document.addEventListener("mousemove", mousemove);
  }

  function mouseup(e) {
    initialEvent = null;
    immutableContainer = null;
    document.body.style.userSelect = "auto";
    document.body.style.cursor = "auto";
    accessor?.()?.onDragEnd?.(e);
    document.removeEventListener("mousemove", mousemove);
  }

  function mouseleave(e) {
    accessor?.()?.onDragEnd?.(e);
    document.removeEventListener("mousemove", mousemove);
  }

  el.addEventListener("mousedown", mousedown);
  document.addEventListener("mouseup", mouseup);
  document.addEventListener("mouseleave", mouseleave);

  onCleanup(() => {
    el.removeEventListener("mousedown", mousedown);
    document.removeEventListener("mouseup", mouseup);
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseleave", mouseleave);
  });
}
