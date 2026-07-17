import { registerCleanup, restoreProperty } from './cleanup';

export const createDocumentVisibilityController = (
  initialVisibility = 'visible'
) => {
  let visibilityState = initialVisibility;

  const originalVisibilityDescriptor = Object.getOwnPropertyDescriptor(
    document,
    'visibilityState'
  );

  const originalHiddenDescriptor = Object.getOwnPropertyDescriptor(
    document,
    'hidden'
  );

  Object.defineProperty(document, 'visibilityState', {
    configurable: true,

    get() {
      return visibilityState;
    },
  });

  Object.defineProperty(document, 'hidden', {
    configurable: true,

    get() {
      return visibilityState === 'hidden';
    },
  });

  registerCleanup(() => {
    restoreProperty(document, 'visibilityState', originalVisibilityDescriptor);

    restoreProperty(document, 'hidden', originalHiddenDescriptor);
  });

  return {
    get visibilityState() {
      return visibilityState;
    },

    setVisibility(nextVisibility) {
      visibilityState = nextVisibility;
      document.dispatchEvent(new Event('visibilitychange'));
    },
  };
};
