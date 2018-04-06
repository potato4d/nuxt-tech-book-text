'use strict';

const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const pug = require('pug');

const remark = require('remark');
const mark2hype = require('remark-rehype');
const rehypeStringify = require('rehype-stringify');
const remarkHighlight = require('./lib/remark-highlight');
const mdast2hastHandlers = require('./lib/mdast2hast-handlers');

const processor = remark()
  .use(remarkHighlight)
  .use(mark2hype, {
    handlers: mdast2hastHandlers,
  })
  .use(rehypeStringify)
  .freeze();

Object.assign(pug.filters, {
  markdown: (str, options) => {
    return processor.processSync(str).toString();
  },
});

const $ = gulpLoadPlugins();
const plumberOpt = {
  errorHandler: function(err) {
    console.error(err.stack);
    this.emit('end');
  },
}

gulp.task('default', ['html']);

gulp.task('html', () => {
  gulp.src('src/index.pug')
    .pipe($.plumber(plumberOpt))
    .pipe($.pug({
      pug: pug,
      pretty: true,
    }))
    .pipe(gulp.dest('dest/'));
});
