# metalsmith-ldschema
Metalsmith plugin for generating Web documentation for a linked data vocabulary. Inspired by https://schema.org

## Requirements
* Node v8.6.0 or later

## Installation
* Create a new static Web site using [metalsmith](http://www.metalsmith.io/)
* `npm install --save metalsmith-ldschema`
* Create one or more [RDF](https://www.w3.org/TR/rdf11-concepts/) files in your site directory. Your rdf-schema vocabulary will be defined in these files. While any RDF serialization should be supported by the site generator, it has at present been tested with [JSON-LD](http://json-ld.org/) and [Turtle](https://www.w3.org/TeamSubmission/turtle/)
* Create templates for `rdfs:Class` and/or `rdf:Property`
* Specify your templates for `rdfs:Class` and `rdf:Property` in your metalsmith build configuration.

## Reference Site
Until comprehensive documentation can be created, the general use cases can be seen through the included reference applications.
