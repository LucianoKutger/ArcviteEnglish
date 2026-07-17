export const MODAL_VISIBILITY_EVENT = 'arcvite:modal-visibility';

export const isModalOpen = () =>
  typeof document !== 'undefined' &&
  document.body?.dataset.arcviteModalOpen === 'true';

export const setModalOpen = (open) => {
  if (typeof document === 'undefined' || !document.body) {
    return;
  }

  if (open) {
    document.body.dataset.arcviteModalOpen = 'true';
  } else {
    delete document.body.dataset.arcviteModalOpen;
  }

  document.dispatchEvent(
    new CustomEvent(MODAL_VISIBILITY_EVENT, {
      detail: { open },
    })
  );
};
