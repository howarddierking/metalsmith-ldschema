const metalsmith = require('metalsmith');
const R = require('ramda');
const layouts = require('metalsmith-layouts');
const permalinks = require('metalsmith-permalinks')
const serve = require('metalsmith-serve');
const watch = require('metalsmith-watch');
// const ldschema = require('metalsmith-ldschema');
const ldschema = require('../../plugin/');


metalsmith(__dirname)
  .source('./src')
  .destination('./site')
  .use(ldschema({
    classLayout: 'class.hbs',
    propertyLayout: 'property.hbs',
    indexLayout: 'index.hbs',
    base: 'http://localhost:8080/'
  }))
  .use(layouts())
  .use(permalinks({
    relative: false
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
