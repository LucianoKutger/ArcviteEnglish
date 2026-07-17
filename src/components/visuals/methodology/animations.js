export const IMPACT_FLOW_ANIMATION = {
  pathOffset: [-0.15, 1],
  opacity: [0.5, 1, 0.5],
  strokeWidth: [2, 6, 2],
  transition: {
    pathOffset: { duration: 4, repeat: Infinity, ease: 'linear' },
    opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    strokeWidth: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const POLAR_STAR_ANIMATION = {
  r: 14,
  opacity: 0,
  transition: { duration: 2.5, repeat: Infinity, ease: 'easeOut' },
};
