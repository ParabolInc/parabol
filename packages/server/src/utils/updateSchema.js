import fs from 'fs'
import {graphql, printSchema, introspectionQuery} from 'graphql'
import path from 'path'
import schema from '../graphql/rootSchema'

const PROJECT_ROOT = path.join(__dirname, '..', '..', '..')
const BUILD_ROOT = path.join(PROJECT_ROOT, 'build')

const schemaPath = path.join(PROJECT_ROOT, 'schema.graphql')
const jsonPath = path.join(BUILD_ROOT, 'schema.json')
;(async () => {
  const result = await graphql(schema, introspectionQuery)
  if (!fs.existsSync(BUILD_ROOT)) {
    fs.mkdirSync(BUILD_ROOT)
  }
  fs.writeFileSync(schemaPath, printSchema(schema))
  // fs.writeFileSync(
  //   path.join(PROJECT_ROOT, 'schema_legacy.graphql'),
  //   printSchema(schema, {commentDescriptions: true})
  // )
  // use json for IDE plugins
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2))
  console.log('Schema updated!')
})()
