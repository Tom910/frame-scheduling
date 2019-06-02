const context = typeof window !== "undefined" ? window : global;

export type Defer = (f: () => void) => void;

export let defer: Defer;
if ("requestAnimationFrame" in context) {
  defer = requestAnimationFrame;
} else if ("setImmediate" in context) {
  defer = (context as any).setImmediate;
} else {
  defer = setTimeout;
}
