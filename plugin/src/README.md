# metalsmith-ldschema
Metalsmith plugin for generating Web documentation for a linked data vocabulary. Inspired by https://schema.org

## Installation
* Create a new static Web site using [metalsmith](http://www.metalsmith.io/)
* `yarn add metalsmith-ldschema`
* Create one or RDF files in your source directory. At present, 2 serializations are supported
  * [JSON-LD](http://json-ld.org/) 
  * [Turtle](https://www.w3.org/TR/turtle/)
* Create templates for `rdfs:Class` and/or `rdf:Property`
* Specify your templates for `rdfs:Class` and `rdf:Property` in your metalsmith build configuration.

## Reference Site
Until comprehensive documentation can be created, the general use cases can be seen through the included reference application.

## Adding new serializers
TODO
