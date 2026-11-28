import { useEffect, useRef } from 'react';

// Stack of open dialogs: Escape closes only the top-most one
// (e.g. the terms dialog opened on top of the sign-up dialog).
// While any dialog is open, the page behind it does not scroll.
const stack: Array<{ current: () => void }> = [];

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape' || !stack.length) return;
  e.preventDefault();
  stack[stack.length - 1].current();
};

// ---- background scroll lock
let saved: { htmlOverflow: string; bodyOverflow: string; bodyPaddingRight: string } | null = null;

const lockScroll = () => {
  if (saved) return;
  const html = document.documentElement;
  const body = document.body;
  saved = { htmlOverflow: html.style.overflow, bodyOverflow: body.style.overflow, bodyPaddingRight: body.style.paddingRight };
  // Keep the layout from jumping when the desktop scrollbar disappears
  const scrollbar = window.innerWidth - html.clientWidth;
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
  html.style.overflow = 'hidden';
  body.style.overflow = 'hidden';
};

const unlockScroll = () => {
  if (!saved) return;
  const html = document.documentElement;
  const body = document.body;
  html.style.overflow = saved.htmlOverflow;
  body.style.overflow = saved.bodyOverflow;
  body.style.paddingRight = saved.bodyPaddingRight;
  saved = null;
};

/** For every dialog: close with Escape, and lock page scrolling while it is open. */
export function useEscapeClose(onClose: () => void, active = true) {
  const ref = useRef(onClose);
  ref.current = onClose;

  useEffect(() => {
    if (!active) return;
    const entry = ref;
    if (!stack.length) {
      window.addEventListener('keydown', onKeyDown);
      lockScroll();
    }
    stack.push(entry);
    return () => {
      const i = stack.lastIndexOf(entry);
      if (i >= 0) stack.splice(i, 1);
      if (!stack.length) {
        window.removeEventListener('keydown', onKeyDown);
        unlockScroll();
      }
    };
  }, [active]);
}
