import { useEffect, useState, type RefObject } from 'react';

/**
 * `true` mientras el elemento está (o casi está, según `rootMargin`) en pantalla.
 * Sirve para detener timers/animaciones JS fuera de vista. Sin IntersectionObserver
 * (navegadores muy antiguos) asume visible, para no romper nada.
 */
export function useInViewport<T extends Element>(ref: RefObject<T | null>, rootMargin = '120px'): boolean {
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
