const metalsmith = require('metalsmith');
const R = require('ramda');
const layouts = require('metalsmith-layouts');
const ldschema = require('../../plugin');
const permalinks = require('metalsmith-permalinks')
const serve = require('metalsmith-serve');
const watch = require('metalsmith-watch');

metalsmith(__dirname)
  .source('./src')
  .destination('./site')
  .use(ldschema({
    classLayout: 'class.html',
    propertyLayout: 'property.html'
  }))
  .use(permalinks({
    pattern: ':title'
  }))
  .use(layouts({
    engine: 'qejs',
    directory: 'layouts',
    R: R
  }))
  .use(serve({
    host: "0.0.0.0",
    port: "8080",
    verbose: true
  }))
  .use(watch({
    pattern: '**/*',
    livereload: true
  }))
  .build(function(err){
    if(err)
      console.error(err)
    else
      console.info('Site build successful!');
  });
