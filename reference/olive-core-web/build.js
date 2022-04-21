import { fileURLToPath } from 'url';
import { dirname } from 'path';
import metalsmith from 'metalsmith';
import * as R from 'ramda';
import layouts from 'metalsmith-layouts';
import permalinks from 'metalsmith-permalinks';
import serve from 'metalsmith-serve';
import watch from 'metalsmith-watch';
import ldschema from '../plugin/src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

metalsmith(__dirname)
  .source('./src')
  .destination('./site')
  .use(ldschema({
    classLayout: 'class.ejs',
    propertyLayout: 'property.ejs',
    indexLayout: 'index.ejs',
    base: 'http://localhost:8080'
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
