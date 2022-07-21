export function id(id: string): HTMLElement | null {
  return document.getElementById(id);
}

type HTMLElementOrWindowEventMap = HTMLElementEventMap & WindowEventMap;
type HTMLElementAndWindowEventMap = HTMLElementEventMap | WindowEventMap;
type HTMLElementOrWindow<K extends keyof HTMLElementOrWindowEventMap> =
  K extends keyof HTMLElementAndWindowEventMap ? HTMLElement | Window :
  K extends keyof HTMLElementEventMap ? HTMLElement :
  K extends keyof WindowEventMap ? Window : never;
type HTMLElementOrWindowEvent<K> =
  K extends keyof HTMLElementEventMap ? HTMLElementEventMap[K] :
  K extends keyof WindowEventMap ? WindowEventMap[K] : never;
export function listen<K extends keyof HTMLElementOrWindowEventMap>(element: HTMLElementOrWindow<K>, event: K, listener: (this: typeof element, event: HTMLElementOrWindowEvent<K>) => void): void {
  element.addEventListener(event, listener as any);
}

export function forEach<T>(iterable: Iterable<T> | ArrayLike<T>, func: (value: T, index: number, array: T[]) => void): void {
  Array.from(iterable).forEach(func);
}
