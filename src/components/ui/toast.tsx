import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check } from "lucide-react";

type ToastItem = { id: number; msg: string };
const ToastCtx = createContext<{ toast: (msg: string) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const toast = (msg: string) => {
    const id = ++idRef.current;
    setItems((s) => [...s, { id, msg }]);
    window.setTimeout(() => {
      setItems((s) => s.filter((t) => t.id !== id));
    }, 2600);
  };

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {items.map((i) => (
          <div
            key={i.id}
            className="pointer-events-auto flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-lg animate-[menu-in_160ms_ease-out]"
          >
            <span className="grid size-5 place-items-center rounded-full bg-success/15 text-success">
              <Check className="size-3.5" />
            </span>
            {i.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
