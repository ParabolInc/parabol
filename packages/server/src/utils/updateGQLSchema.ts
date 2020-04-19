import fs from 'fs'
import {graphql, introspectionQuery, printSchema} from 'graphql'
import path from 'path'
import {promisify} from 'util'
import schema from '../graphql/rootSchema'

const write = promisify(fs.writeFile)
const PROJECT_ROOT = path.join(__dirname, '..', '..', '..')
const schemaPath = path.join(PROJECT_ROOT, 'schema.graphql')
const jsonPath = path.join(PROJECT_ROOT, 'schema.json')

const updateGQLSchema = async (context) => {
  if (context.isUpdating) {
    context.isUpdateQueued = true
    return
  }
  context.isUpdating = true
  const result = await graphql(schema, introspectionQuery)
  const nextSchema = printSchema(schema)
  if (context.oldSchema === nextSchema) {
    context.isUpdating = false
    console.log('no change')
    return
  }
  context.oldSchema = nextSchema
  await Promise.all([
    write(schemaPath, nextSchema),
    write(jsonPath, JSON.stringify(result, null, 2))
  ])
  context.isUpdating = false

  if (context.isUpdateQueued) {
    setTimeout(updateGQLSchema, 1000)
  }
  console.log('new schema saved!')
}

export default updateGQLSchema
