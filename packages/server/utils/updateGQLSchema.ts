import fs from 'fs'
import {printSchema} from 'graphql'
import path from 'path'
import {promisify} from 'util'
import getProjectRoot from '../../../scripts/webpack/utils/getProjectRoot'
import schema from '../graphql/rootSchema'

const write = promisify(fs.writeFile)
// relative to the output file
const PROJECT_ROOT = getProjectRoot()
const schemaPath = path.join(PROJECT_ROOT, 'schema.graphql')

const updateGQLSchema = async () => {
  const nextSchema = printSchema(schema)
  await write(schemaPath, nextSchema)
}

export default updateGQLSchema
