import * as R from 'ramda';
import * as path from 'path';
import rdf from 'rdf-ext';
import rdfParser from 'rdf-parse';
import { Readable } from 'stream';
import * as Rx from './ramdaExt.js';


// parseFileData: String, String, Object -> Promise Dataset
export const parseFileData = async (baseIRI, fileName, fileStream) => {
    console.info(`${fileName} parsing started`);

    return new Promise((resolve, reject) => {
        const ds = rdf.dataset();

        rdfParser.default.parse(fileStream, { path: fileName, baseIRI })
        .on('data', q => {
            ds.add(q);
        })
        .on('error', e => {
            console.error(e)
            reject(e);
        })
        .on('end', () => {
            console.info(`${fileName} parsing finished`);
            resolve(ds);
        });
    });
};


// from: Object -> {String: Object} -> Promise Dataset
export const from = R.curry(async (config, files) => {
    // map files to [Promise Dataset]
    const datasetPromises = R.map(
        p => parseFileData(
            config.baseIRI, 
            p[0],
            Readable.from(p[1].contents)), 
        R.toPairs(files));

    const datasets = await Promise.all(datasetPromises)

    // merge all the datasets and return them
    const u = R.reduce(
        (accum, ds) => accum.addAll(ds),
        rdf.dataset(),
        datasets);

    return u;
});
