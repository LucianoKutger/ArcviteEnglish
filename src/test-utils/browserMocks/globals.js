export const getGlobalTargets = () => {
  const targets = [globalThis];

  if (typeof window !== 'undefined' && window !== globalThis) {
    targets.push(window);
  }

  return targets;
};
