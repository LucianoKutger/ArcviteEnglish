export const initialMethodologyInteractionState = {
  hoveredSegment: null,
  activeContentId: null,
  pendingSegment: null,
  isExiting: false,
};

const activateSegment = (state, segment) => ({
  ...state,
  hoveredSegment: segment,
  activeContentId: segment.id,
  pendingSegment: null,
  isExiting: false,
});

export const methodologyInteractionReducer = (state, action) => {
  switch (action.type) {
    case 'segment-enter': {
      const { segment } = action;
      const waitForCloseBeforeOpen = action.waitForCloseBeforeOpen ?? true;

      if (state.activeContentId === segment.id && !state.isExiting) {
        return {
          ...state,
          hoveredSegment: segment,
          pendingSegment: null,
        };
      }

      if (!waitForCloseBeforeOpen) {
        return activateSegment(state, segment);
      }

      if (state.activeContentId === null) {
        if (state.isExiting) {
          return {
            ...state,
            hoveredSegment: segment,
            pendingSegment: segment,
          };
        }

        return activateSegment(state, segment);
      }

      return {
        ...state,
        hoveredSegment: segment,
        activeContentId: null,
        pendingSegment: segment,
        isExiting: true,
      };
    }

    case 'segment-toggle': {
      const { segment } = action;
      const waitForCloseBeforeOpen = action.waitForCloseBeforeOpen ?? true;

      if (!waitForCloseBeforeOpen) {
        if (state.activeContentId === segment.id) {
          return {
            ...state,
            hoveredSegment: null,
            activeContentId: null,
            pendingSegment: null,
            isExiting: true,
          };
        }

        return activateSegment(state, segment);
      }

      if (state.isExiting) {
        if (state.pendingSegment?.id === segment.id) {
          return {
            ...state,
            hoveredSegment: null,
            pendingSegment: null,
          };
        }

        return {
          ...state,
          hoveredSegment: segment,
          pendingSegment: segment,
        };
      }

      if (state.activeContentId === segment.id) {
        return {
          ...state,
          hoveredSegment: null,
          activeContentId: null,
          pendingSegment: null,
          isExiting: true,
        };
      }

      if (state.activeContentId === null) {
        return activateSegment(state, segment);
      }

      return {
        ...state,
        hoveredSegment: segment,
        activeContentId: null,
        pendingSegment: segment,
        isExiting: true,
      };
    }

    case 'interaction-leave':
      return {
        ...state,
        hoveredSegment: null,
        activeContentId: null,
        pendingSegment: null,
        isExiting: state.isExiting || state.activeContentId !== null,
      };

    case 'exit-complete': {
      if (
        action.waitForCloseBeforeOpen === false &&
        state.activeContentId !== null
      ) {
        return state;
      }

      const pendingSegment = state.pendingSegment;

      if (pendingSegment && state.hoveredSegment?.id === pendingSegment.id) {
        return {
          ...state,
          activeContentId: pendingSegment.id,
          pendingSegment: null,
          isExiting: false,
        };
      }

      return {
        ...state,
        activeContentId: null,
        pendingSegment: null,
        isExiting: false,
      };
    }

    case 'reset':
      return initialMethodologyInteractionState;

    default:
      return state;
  }
};
