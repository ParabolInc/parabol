import fs from 'fs'
import { graphql, introspectionQuery, printSchema } from 'graphql'
import path from 'path'
import { promisify } from 'util'
import schema from '../graphql/rootSchema'

const write = promisify(fs.writeFile)
const PROJECT_ROOT = path.join(__dirname, '..', '..', '..')
const BUILD_ROOT = path.join(PROJECT_ROOT, 'build')

const schemaPath = path.join(PROJECT_ROOT, 'schema.graphql')
const jsonPath = path.join(BUILD_ROOT, 'schema.json')
  ; (async () => {
    const result = await graphql(schema, introspectionQuery)
    if (!fs.existsSync(BUILD_ROOT)) {
      fs.mkdirSync(BUILD_ROOT)
    }
    await Promise.all([
      write(schemaPath, printSchema(schema)),
      write(jsonPath, JSON.stringify(result, null, 2))
    ])
    console.log('Schema updated!', schemaPath, jsonPath)
  })()
