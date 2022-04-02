/*
  This file imports our compiled schemas and prints them to a .graphql
  These printed .graphql files are used by codegens, relay-compiler. typeahead support for IDEs, etc.
  To reduce watched file callback, we only want to write the file if there's a change
*/

import fs from 'fs'
import {printSchema} from 'graphql'
import path from 'path'
import {promisify} from 'util'
import privateSchema from '../graphql/private/rootSchema'
import publicSchema from '../graphql/public/rootSchema'

declare const __PROJECT_ROOT__: string

const writeIfChanged = async (dataPath: string, data: string) => {
  const write = promisify(fs.writeFile)
  const read = promisify(fs.readFile)
  try {
    const existingFile = await read(dataPath, {encoding: 'utf-8'})
    if (data === existingFile) return
  } catch {
    // file does not exist
  }
  return write(dataPath, data)
}

const updateGQLSchema = async () => {
  const GQL_ROOT = path.join(__PROJECT_ROOT__, 'packages/server/graphql')
  const publicSchemaPath = path.join(GQL_ROOT, 'public/schema.graphql')
  const privateSchemaPath = path.join(GQL_ROOT, 'private/schema.graphql')
  // TODO only write if different
  await Promise.all([
    writeIfChanged(publicSchemaPath, printSchema(publicSchema)),
    writeIfChanged(privateSchemaPath, printSchema(privateSchema))
  ])
}

export default updateGQLSchema
