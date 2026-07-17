const cleanupCallbacks = [];

export const registerCleanup = (callback) => {
  cleanupCallbacks.push(callback);
};

export const restoreProperty = (target, propertyName, originalDescriptor) => {
  if (originalDescriptor) {
    Object.defineProperty(target, propertyName, originalDescriptor);
    return;
  }

  delete target[propertyName];
};

export const resetBrowserMocks = () => {
  while (cleanupCallbacks.length > 0) {
    const cleanup = cleanupCallbacks.pop();
    cleanup();
  }
};
