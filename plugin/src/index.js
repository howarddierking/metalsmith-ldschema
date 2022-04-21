import { Buffer } from 'buffer';
import * as R from 'ramda';
import * as path from 'path';
import { getRdfFiles } from './fs.js';
import { from as loadGraph} from './loader.js';  
import clownface from 'clownface';
import namespace from '@rdfjs/namespace';

const ns = {
    schema: namespace('http://schema.org/'),
    owl: namespace('http://www.w3.org/2002/07/owl#'),
    rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
    xml: namespace('http://www.w3.org/XML/1998/namespace'),
    xsd: namespace('http://www.w3.org/2001/XMLSchema#'),
    rdfs: namespace('http://www.w3.org/2000/01/rdf-schema#'),
    gist: namespace('https://ontologies.semanticarts.com/gist/'),
    skos: namespace('http://www.w3.org/2004/02/skos/core#'),
    skosxl: namespace('http://www.w3.org/2008/05/skos-xl#'),
    dct: namespace('http://purl.org/dc/terms/'),
    wd: namespace('http://www.wikidata.org/entity/'),
    wdt: namespace('http://www.wikidata.org/prop/direct/')
};

const INDEX_FILENAME = 'index.html';


const generateSite = R.curry(async (options, files, metalsmith, done) => {
    if(!options.classLayout) throw new Error('options.classLayout is required');
    if(!options.propertyLayout) throw new Error('options.propertyLayout is required');
    if(!options.indexLayout) throw new Error('options.indexLayout is required');
    if(!options.base) throw new Error('options.base is required');
    
    const rdfFiles = getRdfFiles(files);
    const ds = await loadGraph(options, rdfFiles);

    const ptr = clownface({dataset: ds});

    const classes = ptr.has(ns.rdf`type`, [ns.rdfs`Class`, ns.owl`Class`]);

    classes.forEach(p => {
        const filename = `${path.basename(p.term.value)}.html`;
        const fileDetails = {
            base: options.base,
            term: p,
            ns,
            basename: path.basename,
            layout: options.classLayout,
            contents: Buffer.from('')};
        files[filename] = fileDetails;
    });

    const properties = ptr.has(ns.rdf`type`, [ns.rdf`Property`, ns.owl`DatatypeProperty`, ns.owl`ObjectProperty`]);

    properties.forEach(p => {
        const filename = `${path.basename(p.term.value)}.html`;
        const fileDetails = {
            base: options.base,
            term: p,
            ns,
            basename: path.basename,
            layout: options.propertyLayout,
            contents: Buffer.from('')};
        files[filename] = fileDetails;
    });

    files[INDEX_FILENAME] = {
        base: options.base,
        classes: classes,
        ns,
        basename: path.basename,
        layout: options.indexLayout,
        contents: Buffer.from('')
    };

    setImmediate(done);
});

export default generateSite;
