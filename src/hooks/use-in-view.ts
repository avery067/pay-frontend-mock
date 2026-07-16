import { useEffect, useRef, useState } from "react";

/** 元素进入视口时置 inView=true（一次性），用于滚动揭示 / 数字滚动 */
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          ob.disconnect();
        }
      },
      { threshold: 0.15, ...options },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  return { ref, inView };
}
