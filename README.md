# metalsmith-ldschema
Metalsmith plugin for generating Web documentation for a linked data vocabulary. Inspired by https://schema.org

## Requirements and Dependencies/Assumptions
* Node v10.15.0 or later
* Metalsmith (^2.3.0)
* Metalsmith Layouts (^2.3.1)
* Metalsmith Permalinks (^2.2.0)
* Docker (optional)

## Installation
* Create a new static Web site using [metalsmith](http://www.metalsmith.io/)
* `yarn add metalsmith-ldschema`
* Create one or more [RDF](https://www.w3.org/TR/rdf11-concepts/) files in your site directory. Your rdf-schema vocabulary will be defined in these files. While any RDF serialization should be supported by the site generator, it has at present been tested with [JSON-LD](http://json-ld.org/) and [Turtle](https://www.w3.org/TeamSubmission/turtle/)

## Configuration Settings

* `classLayout` - Layout file to use when rendering `rdfs:Class` terms. Default value is `class.hbs` and expects to use the [handlebars](https://handlebarsjs.com/) template engine via [jstransformer-handlebars](https://github.com/jstransformers/jstransformer-handlebars)
* `propertyLayout` - Layout file to use when rendering `rdf:Property` terms. Default value is `property.hbs` and expects to use the [handlebars](https://handlebarsjs.com/) template engine via [jstransformer-handlebars](https://github.com/jstransformers/jstransformer-handlebars)
* `indexLayout` - Layout file to use when rendering an index page of all `rdfs:Class` terms. Default value is `index.hbs` and expects to use the [handlebars](https://handlebarsjs.com/) template engine via [jstransformer-handlebars](https://github.com/jstransformers/jstransformer-handlebars)
* `base` - Hostname (including scheme) for the Web site. This value is used when determining whether or not the `href` value in the view model is an absolute or relative URI. If `base` matches the [url.origin](https://nodejs.org/api/url.html#url_url_origin) value of a term's `id`, `href` will be a relative URI - otherwise, it will be an absolute URI.

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
## View Models
When building views, each template will be supplied with a view model containing either a single term, or a list of terms, depending on the type of page being rendered. For both property and class templates, the term will be held in the variable `term` and will contain the following members:

`id` (string) - URI of the term
`type` ('class' | 'property' | '(unknown)') - Term type
`label` (string) - self-explanatory
`comment` (string) - self-explanatory
`href` (string) - URL to the term for the Web site. Based on the `base` configuration value, will be either an absolute or relative URL

In addition to basic identifying information, terms will have data that connects terms to one another. 

Classes will contain the following properties:

* `properties` ([Term]) - properties associated with the class via `rdfs:domain`
* `valueFor` ([Term]) - properties (on any other class) for which the class may be a type via `rdfs:range`
* `parentClasses` ([Term]) - parent classes as specified by `rdfs:subClassOf`
* `childClasses` ([Term]) - child classes as specified by `rdfs:subClassOf`

Properties will contain the following properties:

* `usedOn` ([Term]) - classes on which this property may be found as specified by `rdfs:range`
* `expectedTypes` ([Term]) - possible types for the property as specified by `rdfs:range`

## Supported RDF Terms
* `rdfs:Class`
* `rdf:Property`
* `rdfs:label`
* `rdfs:comment`
* `rdfs:range`
* `rdfs:domain`
* `rdfs:subClassOf`


## Using the Local Server

A common convention in ontology building is to use casing to differentiate classes from properties. This means that it's not uncommon to have a property and a class with the same name but different casing. Popular file systems like OSX's HFS have support for case-sensitivity, but it requires additional operating system configuration (e.g. journaling) which may be made increasingly complex by the addition of developer operating systems.

Rather than ask users to change core OS settings, the Docker image `metalsmith-ldjson-server` is provided as a local server. This server is built on Alpine Linux and a file system that provides full support for case-sensitive filenames.

To use, simply mount your metalsmith-ldschema project directory into `/project`, map your desired local port to `8080` in the container and execute a command as follows: 

```
docker run -it -v "$(pwd):/project" -p 8080:8080 metalsmith-ldschema-host:latest "yarn run build"
```

## Tests

Tests for the plugin can be run with `yarn run test` from within the plugin directory

## Reference Site
Until comprehensive documentation can be created, the general use cases can be seen through the included reference applications.
