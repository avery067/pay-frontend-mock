import { useEffect, useState } from "react";

/** 模拟页面数据加载：挂载后 ms 毫秒内返回 loading=true，用于展示骨架屏 */
export function usePageLoading(ms = 450) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(t);
  }, []);
  return loading;
}
