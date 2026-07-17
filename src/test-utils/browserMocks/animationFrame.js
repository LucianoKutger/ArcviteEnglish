import { vi } from 'vitest';

import { registerCleanup, restoreProperty } from './cleanup';
import { getGlobalTargets } from './globals';

export const createAnimationFrameController = () => {
  let nextFrameId = 1;
  const callbacks = new Map();
  const targets = getGlobalTargets();

  const originalDescriptors = targets.map((target) => ({
    target,
    requestAnimationFrame: Object.getOwnPropertyDescriptor(
      target,
      'requestAnimationFrame'
    ),
    cancelAnimationFrame: Object.getOwnPropertyDescriptor(
      target,
      'cancelAnimationFrame'
    ),
  }));

  const requestAnimationFrameMock = vi.fn((callback) => {
    const frameId = nextFrameId;
    nextFrameId += 1;

    callbacks.set(frameId, callback);

    return frameId;
  });

  const cancelAnimationFrameMock = vi.fn((frameId) => {
    callbacks.delete(frameId);
  });

  targets.forEach((target) => {
    Object.defineProperty(target, 'requestAnimationFrame', {
      configurable: true,
      writable: true,
      value: requestAnimationFrameMock,
    });

    Object.defineProperty(target, 'cancelAnimationFrame', {
      configurable: true,
      writable: true,
      value: cancelAnimationFrameMock,
    });
  });

  registerCleanup(() => {
    callbacks.clear();

    originalDescriptors.forEach(
      ({
        target,
        requestAnimationFrame: requestDescriptor,
        cancelAnimationFrame: cancelDescriptor,
      }) => {
        restoreProperty(target, 'requestAnimationFrame', requestDescriptor);

        restoreProperty(target, 'cancelAnimationFrame', cancelDescriptor);
      }
    );
  });

  return {
    requestAnimationFrameMock,
    cancelAnimationFrameMock,

    get pendingFrameCount() {
      return callbacks.size;
    },

    get pendingFrameIds() {
      return Array.from(callbacks.keys());
    },

    runNextFrame(timestamp = 16) {
      const nextFrame = callbacks.entries().next();

      if (nextFrame.done) {
        return false;
      }

      const [frameId, callback] = nextFrame.value;

      callbacks.delete(frameId);
      callback(timestamp);

      return true;
    },

    runFrames(count, startingTimestamp = 16) {
      let executedFrames = 0;

      for (let index = 0; index < count; index += 1) {
        const executed = this.runNextFrame(startingTimestamp + index * 16);

        if (!executed) {
          break;
        }

        executedFrames += 1;
      }

      return executedFrames;
    },
  };
};
