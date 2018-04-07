'use strict';

const u = require('unist-builder');
const wrap = require('mdast-util-to-hast/lib/wrap');

module.exports = {
  code: (h, node) => {
    const filenameBlock = node.filename
      ? h(node.position, 'div', { className: ['code-lang'] }, [u('text', node.filename)])
      : [];

    return h(node.position, 'div', { className: ['code-frame'] }, wrap([].concat(
      filenameBlock,
      h(node.position, 'pre', [
        h(node, 'code', {}, [u('text', node.value)]),
      ])
    ), true));
  },
};
