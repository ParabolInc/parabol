import fs from 'fs';
import {printSchema} from 'graphql';
import path from 'path';
import schema from 'server/graphql/rootSchema';

const schemaPath = path.join(__dirname, '../../../build/schema.graphql');

fs.writeFileSync(schemaPath, printSchema(schema));

console.log('Wrote ' + schemaPath);