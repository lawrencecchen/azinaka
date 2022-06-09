import "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      clickOutside?: () => false;
      drag: {
        onDrag?: (
          e: MouseEvent,
          initialEvent: MouseEvent,
          immutableContainer: any
        ) => any;
        onDragStart?: () => void;
        onDragEnd?: () => void;
        cursorStyle?: string;
      };
    }
  }
}

declare module "virtual:pwa-register/solid" {
  import type { Accessor, Setter } from "solid-js";

  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (
      registration: ServiceWorkerRegistration | undefined
    ) => void;
    onRegisterError?: (error: any) => void;
  }

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: [Accessor<boolean>, Setter<boolean>];
    offlineReady: [Accessor<boolean>, Setter<boolean>];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}
