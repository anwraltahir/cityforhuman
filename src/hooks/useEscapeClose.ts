import { useEffect, useRef } from 'react';

// Stack of open dialogs: Escape closes only the top-most one
// (e.g. the terms dialog opened on top of the sign-up dialog).
const stack: Array<{ current: () => void }> = [];

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape' || !stack.length) return;
  e.preventDefault();
  stack[stack.length - 1].current();
};

/** Close a dialog with the Escape key while it is mounted (and `active`). */
export function useEscapeClose(onClose: () => void, active = true) {
  const ref = useRef(onClose);
  ref.current = onClose;

  useEffect(() => {
    if (!active) return;
    const entry = ref;
    if (!stack.length) window.addEventListener('keydown', onKeyDown);
    stack.push(entry);
    return () => {
      const i = stack.lastIndexOf(entry);
      if (i >= 0) stack.splice(i, 1);
      if (!stack.length) window.removeEventListener('keydown', onKeyDown);
    };
  }, [active]);
}
