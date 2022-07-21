const katex = require('katex');

/**
 * Renders a TeX expression into an HTML element.
 * @param {string} tex 
 * @param {HTMLElement} target 
 * @param {any} macros 
 */
function katexRender(tex, target, macros) {
  katex.render(tex, target, {
    displayMode: true,
    output: 'html',
    throwOnError: false,
    strict: 'ignore',
    macros
  });
}

module.exports = { katexRender };
