import fs from 'fs'
import {printSchema} from 'graphql'
import path from 'path'
import {promisify} from 'util'
import privateSchema from '../graphql/private/rootSchema'
import publicSchema from '../graphql/public/rootSchema'

declare const __PROJECT_ROOT__: string

const updateGQLSchema = async () => {
  const write = promisify(fs.writeFile)
  const GQL_ROOT = path.join(__PROJECT_ROOT__, 'packages/server/graphql')
  const publicSchemaPath = path.join(GQL_ROOT, 'public/schema.graphql')
  const privateSchemaPath = path.join(GQL_ROOT, 'private/schema.graphql')
  await Promise.all([
    write(publicSchemaPath, printSchema(publicSchema)),
    write(privateSchemaPath, printSchema(privateSchema))
  ])
}

export default updateGQLSchema
