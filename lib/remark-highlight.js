'use strict';

const visit = require('unist-util-visit');
const low = require('lowlight');

module.exports = attacher;

function attacher() {
  return function transformer(tree, file) {
    visit(tree, 'code', (node, index, parent) => {
      const { lang, value } = node;
      if (!lang) {
        return;
      }
      let { data } = node;
      if (!data) {
        node.data = data = {};
      }

      // コードブロックの"言語:ファイル名"記法に対応
      const [s, ...xs] = lang.split(':');
      const filename = xs.join(':');
      try {
        data.hChildren = low.highlight(s, value).value;
      } catch (err) {
        data.hChildren = low.highlightAuto(value).value;
      }

      data.hProperties = data.hProperties || {};
      data.hProperties.className = [
        'hljs',
        ...data.hProperties.className || [],
        `language-${s}`,
      ];
      if (filename !== '') {
        node.lang = s;
        node.filename = filename;
        data.hProperties.dataFilename = filename;
      }
    });
  };
}
