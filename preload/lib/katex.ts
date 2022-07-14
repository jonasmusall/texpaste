import katex from 'katex';

export function katexRender(tex: string, target: HTMLElement, macros: any) {
  katex.render(tex, target, {
    displayMode: true,
    output: 'html',
    throwOnError: false,
    strict: 'ignore',
    macros
  });
}
