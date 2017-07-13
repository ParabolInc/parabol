import fs from 'fs';
import {graphql, printSchema, introspectionQuery} from 'graphql';
import path from 'path';
import schema from 'server/graphql/rootSchema';

const buildDir = path.join(process.cwd(), 'build');
const schemaPath = path.join(buildDir, 'schema.graphql');
const jsonPath = path.join(buildDir, 'schema.json');

(async () => {
  const result = await graphql(schema, introspectionQuery);
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
  }
  fs.writeFileSync(schemaPath, printSchema(schema));
  // use json for IDE plugins
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
  console.log('Schema updated!');
})();
