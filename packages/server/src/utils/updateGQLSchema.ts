import fs from 'fs'
import {printSchema} from 'graphql'
import path from 'path'
import {promisify} from 'util'
import schema from '../graphql/rootSchema'

const write = promisify(fs.writeFile)
// relative to the output file
const PROJECT_ROOT = path.join(__dirname, '..')
const schemaPath = path.join(PROJECT_ROOT, 'schema.graphql')

interface Context {
  throttleId?: any
  oldSchema?: string
  delay: number
}
const updateGQLSchema = (context: Context = {delay: 0}) => {
  return new Promise<boolean>((resolve) => {
    if (context.throttleId) {
      resolve(false)
      return
    }
    clearTimeout(context.throttleId)
    context.throttleId = setTimeout(async () => {
      context.throttleId = undefined
      const nextSchema = printSchema(schema)
      if (context.oldSchema === nextSchema) return
      context.oldSchema = nextSchema
      await write(schemaPath, nextSchema)
      console.log(`💥💥💥 GraphQL Schema Created    💥💥💥`)
      resolve(true)
    }, context.delay)
  })
}

export default updateGQLSchema
