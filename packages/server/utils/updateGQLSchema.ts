import fs from 'fs'
import {printSchema} from 'graphql'
import path from 'path'
import {promisify} from 'util'
import privateSchema from '../graphql/intranetSchema/intranetSchema'
import schema from '../graphql/rootSchema'

declare const __PROJECT_ROOT__: string

const write = promisify(fs.writeFile)
const schemaPath = path.join(__PROJECT_ROOT__, 'schema.graphql')
const privateSchemaPath = path.join(
  __PROJECT_ROOT__,
  'packages/server/graphql/intranetSchema/intranetSchema.graphql'
)
const updateGQLSchema = async () => {
  const nextSchema = printSchema(schema)
  const nextPrivateSchema = printSchema(privateSchema)
  await Promise.all([write(schemaPath, nextSchema), write(privateSchemaPath, nextPrivateSchema)])
}

export default updateGQLSchema
