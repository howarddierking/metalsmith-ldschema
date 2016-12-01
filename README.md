# metalsmith-ldschema
Metalsmith plugin for generating Web documentation for a linked data vocabulary. Inspired by https://schema.org

## Installation
* Create a new static Web site using [metalsmith](http://www.metalsmith.io/)
* `npm install --save metalsmith-ldschema`
* Create one or more [JSON-LD](http://json-ld.org/) files in your site directory. Your rdf-schema vocabulary will be defined in these files.
* Create templates for `rdfs:Class` and/or `rdf:Property`
* Specify your templates for `rdfs:Class` and `rdf:Property` in your metalsmith build configuration.

## Reference Site
Until comprehensive documentation can be created, the general use cases can be seen through the included reference application.
