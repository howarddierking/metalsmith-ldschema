# metalsmith-ldschema
Metalsmith plugin for generating Web documentation for a linked data vocabulary. Inspired by https://schema.org

## Requirements and Dependencies/Assumptions
* Node v10.15.0 or later
* Metalsmith (^2.3.0)
* Metalsmith Layouts (^2.3.1) plus a JSTransformer of your choosing.
* Metalsmith Permalinks (^2.2.0)
* Docker (optional but desirable)

## Installation
* Create a new static Web site using [metalsmith](http://www.metalsmith.io/)
* `yarn add metalsmith-ldschema`
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
    base: 'http://schema.howarddierking.com',
    query: `(SPARQL query)`,
    isClass: <Term> => <Boolean>
    getLayout: (<Options>, <String>) => <String>
  }));
```

* `classLayout` (optional) - Layout file to use when rendering `rdfs:Class` terms. Default value is `class.hbs` and expects to use the [handlebars](https://handlebarsjs.com/) template engine via [jstransformer-handlebars](https://github.com/jstransformers/jstransformer-handlebars)
* `propertyLayout` (optional) - Layout file to use when rendering `rdf:Property` terms. Default value is `property.hbs` and expects to use the [handlebars](https://handlebarsjs.com/) template engine via [jstransformer-handlebars](https://github.com/jstransformers/jstransformer-handlebars)
* `indexLayout` (optional) - Layout file to use when rendering an index page of all `rdfs:Class` terms. Default value is `index.hbs` and expects to use the [handlebars](https://handlebarsjs.com/) template engine via [jstransformer-handlebars](https://github.com/jstransformers/jstransformer-handlebars)
* `base` (optional) - Hostname (including scheme) for the Web site. This value is used as a mask for determining whether or not the `href` value in the view model is an absolute or relative URI. If `base` matches the [url.origin](https://nodejs.org/api/url.html#url_url_origin) value of a term's `id`, `href` will be a relative URI - otherwise, it will be an absolute URI.
* `query` (optional) - [SPARQL](https://www.w3.org/TR/rdf-sparql-query/) query used to dynamically build the view model. The view model will contain the properties specified in the `select` clause of the SPARQL query with the leading '?' character removed. Note that the SPARQL engine used in [rdflib.js](https://github.com/linkeddata/rdflib.js) does not support the full set of language capabilities. The default query covers basic RDF metadata and is as follows:

```
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> 

select ?id ?type ?label ?comment ?parent ?domain ?range
where 
{ 
    ?id rdf:type ?type ;
        rdfs:label ?label .
    OPTIONAL { 
        ?id rdfs:comment ?comment . 
    }
    OPTIONAL { 
        ?id rdfs:domain ?domain;
              rdfs:range ?range .
    }
    OPTIONAL {
        ?id rdfs:subClassOf ?parent .
    }
}
```

* `isClass` (optional) - A predicate function used to filter the complete set of terms so that classes can be displayed as a part of the index page. The default value filters on the `type` parameter equalling the value `rdfs:Class`.
* `getLayout` (optional) - A selection function used to determine the metalsmith layout based on a term's type. The default function selects the value specified by `options.classLayout` or `options.propertyLayout` (or a default layout file value) based on whether the term's type is `rdfs:Class` or `rdf:Property`, respectively.

## View Models
When building views, each template will be supplied with a view model containing either a single term or a list of terms (`classes` in the case of the index page), depending on the type of page being rendered. For both property and class templates, the term will be held in the variable `term` and will contain properties based on either the supplied or the default SPARQL query. For example, the default query will yield a term view model resembling the following:

`id` [<URI>] - URI of the term
`type` [<URI>] - Term type
`label` [<String>] - Self-explanatory
`comment` [<String>] - Self-explanatory
`domain` [<URI>] - For property terms, domain represents the class on which the property may be found
`range` [<URI>] - For property terms, range represents the possible types that the property value may be

In addition to the properties created from the supplied SPARQL query, the library adds the additional properties based on the provided input. Note that while the specific terms are no longer significant (thereby supporting ontologies other than [RDF and RDFS](https://www.w3.org/TR/rdf11-mt/)), the parameter names need to be consistent in a supplied SPARQL query.

* `href` <String> - URL to the term for the Web site. Based on the `base` configuration value, will be either an absolute or relative URL
* `properties` [<Term>] - For class terms, properties associated with the class via `rdfs:domain`
* `valueFor` [<Term>] - For class terms, properties for which the class may be a type via `rdfs:range`
* `parentClasses` [<Term>] - For class terms, parent classes as specified by `rdfs:subClassOf`
* `childClasses` [<Term>] - For class terms, child classes as specified by `rdfs:subClassOf`
* `usedOn` [<Term>] - For property terms, classes on which the property may be found as specified by `rdfs:range`
* `expectedTypes` [<Term>] - For property terms, possible types for the property as specified by `rdfs:range`

## Using the Local Server

A common convention in ontology building is to use casing to differentiate classes from properties. This means that it's not uncommon to have a property and a class with the same name but different casing. Popular file systems like OSX's HFS have support for case-sensitivity, but it requires additional operating system configuration (e.g. journaling) which may be made increasingly complex by the addition of developer operating systems.

Rather than ask users to change core OS settings, the Docker image `metalsmith-ldjson-server` is provided as a local server. This server is built on Alpine Linux and a file system that provides full support for case-sensitive filenames.

To use, simply mount your metalsmith-ldschema project directory into `/project`, map your desired local port to `8080` in the container and execute a command as follows: 

```
docker run -it \
    -v "$(pwd):/project" \
    -p 8080:8080 howarddierking/metalsmith-ldschema-host:latest \
    "yarn install && npx bower install --allow-root && yarn run build"
```

## Tests

Tests for the plugin can be run with `yarn run test` from within the plugin directory

## Reference Site
Until comprehensive documentation can be created, the general use cases can be seen through the included reference applications.
