# metalsmith-ldschema
Metalsmith plugin for generating Web documentation for a linked data vocabulary. Inspired by https://schema.org

## Requirements and Dependencies/Assumptions
* Node v16
* Metalsmith (^2.3.0)
* Metalsmith Layouts (^2.3.1) plus a JSTransformer of your choosing (preferrably [EJS](https://github.com/mde/ejs))
* Metalsmith Permalinks (^2.2.0)
* [Clownface](https://zazuko.github.io/clownface/)
* Docker (optional but desirable)

## Installation
* Create a new static Web site using [metalsmith](http://www.metalsmith.io/)
* `npm install metalsmith-ldschema`
* Create one or more [RDF](https://www.w3.org/TR/rdf11-concepts/) files in your site directory. Your rdf-schema vocabulary will be defined in these files. While any RDF serialization should be supported by the site generator, it has at present been tested with [JSON-LD](http://json-ld.org/) and [Turtle](https://www.w3.org/TeamSubmission/turtle/)

## Configuration Settings

The following represents an example configuration:

```
metalsmith(__dirname)
  .source('./src')
  .destination('./site')
  .use(ldschema({
    classLayout: 'class.hbs',
    propertyLayout: 'property.hbs',
    indexLayout: 'index.hbs',
    base: 'http://schema.howarddierking.com'
  }));
```

* `classLayout` (required) - Layout file to use when rendering `rdfs:Class` terms. 
* `propertyLayout` (required) - Layout file to use when rendering `rdf:Property` terms. 
* `indexLayout` (required) - Layout file to use when rendering an index page of all `rdfs:Class` terms. 
* `base` (required) - Hostname (including scheme) for the Web site. This value is used as a mask for determining whether or not the `href` value in the view model is an absolute or relative URI. If `base` matches the [url.origin](https://nodejs.org/api/url.html#url_url_origin) value of a term's `id`, `href` will be a relative URI - otherwise, it will be an absolute URI.
    * NOTE: as of the current refactoring, the determination logic has been elided and needs to be added back

## Using the Local Server

A common convention in ontology building is to use casing to differentiate classes from properties. This means that it's not uncommon to have a property and a class with the same name but different casing. Popular file systems like OSX's HFS have support for case-sensitivity, but it requires additional operating system configuration (e.g. journaling) which may be made increasingly complex by the addition of developer operating systems.

Rather than ask users to change core OS settings, the Docker image `metalsmith-ldjson-server` is provided as a local server. This server is built on Alpine Linux and a file system that provides full support for case-sensitive filenames.

To use, simply mount your metalsmith-ldschema project directory into `/project`, map your desired local port to `8080` in the container and execute a command as follows: 

```
docker run -it \
    -v "$(pwd):/project" \
    -p 8080:8080 howarddierking/metalsmith-ldschema-host:latest \
    "npm install && npm run build"
```

## Tests

Tests for the plugin can be run with `npm run test` from within the plugin directory.
