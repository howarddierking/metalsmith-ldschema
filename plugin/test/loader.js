import * as fs from 'fs';
import { fileURLToPath } from 'url';
import * as path from 'path';
import * as loader from '../src/loader.js';
import { should } from 'chai';
should();

const testFilePath = testFileName => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    return path.join(__dirname, testFileName);
};

describe('graph', () => {
    describe('loader', () => {
        const loaderConfig = { 
            baseIRI: 'http://schema.acme.com/' 
        }; 

        describe('#from', () => {
            let input = null;

            // eslint-disable-next-line no-undef
            // https://stackoverflow.com/questions/8817423/why-is-dirname-not-defined-in-node-repl
            before(() => {
                input = {
                    'bug.ttl': {
                        contents: fs.readFileSync(testFilePath('bug.ttl')),
                        mode: '0644'
                    },
                    'collaborator.jsonld': {
                        contents: fs.readFileSync(testFilePath('collaborator.jsonld')),
                        mode: '0644'
                    }
                };
            });

            it('should produce a graph from different file types', async () => {
                const graph = await loader.from(loaderConfig, input);

                should().exist(graph);
                graph.size.should.eql(66);
            });
        });
    });
});
