import { createReadStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as Graph from './src/graph/loader.js';

const testFilePath = testFileName => {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    return join(__dirname, testFileName);
};

const graph = await Graph.parseFileData(
    'http://schema.acme.com/', 
    'bug.ttl', 
    createReadStream(testFilePath('./olive_core.ttl')));

console.info(graph.toString());
