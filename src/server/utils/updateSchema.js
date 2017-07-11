import fs from 'fs';
import {graphql, printSchema, introspectionQuery} from 'graphql';
import path from 'path';
import schema from 'server/graphql/rootSchema';

const schemaPath = path.join(__dirname, '../../../build/schema.graphql');
const jsonPath = path.join(__dirname, '../../../build/schema.json');

(async () => {
  const result = await graphql(schema, introspectionQuery);
  fs.writeFileSync(schemaPath, printSchema(schema));
  // use json for IDE plugins
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
  console.log('Schema updated!');
})();
