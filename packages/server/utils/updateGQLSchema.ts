/*
  This file imports our compiled schemas and prints them to a .graphql
  These printed .graphql files are used by codegens, relay-compiler. typeahead support for IDEs, etc.
  To reduce watched file callback, we only want to write the file if there's a change
*/

import {mergeSchemas} from '@graphql-tools/schema'
import {printSchema} from 'graphql'
import {readFile, writeFile} from 'node:fs/promises'
import path from 'path'
import getProjectRoot from '../../../scripts/webpack/utils/getProjectRoot'
import {typeDefs as privateTypeDefs} from '../graphql/private/importedTypeDefs'
import {typeDefs} from '../graphql/public/importedTypeDefs'
import {nestGitLab} from '../graphql/public/nestGitLab'
import {nestLinear} from '../graphql/public/nestLinear'
import {nestGitHub} from './nestGitHub'

const writeIfChanged = async (dataPath: string, data: string) => {
  try {
    const existingFile = await readFile(dataPath, {encoding: 'utf-8'})
    if (data === existingFile) return
  } catch {
    // file does not exist
  }
  return writeFile(dataPath, data)
}

const updateGQLSchema = async () => {
  const projectRoot = getProjectRoot()!
  const GQL_ROOT = path.join(projectRoot, 'packages/server/graphql')
  const publicSchemaPath = path.join(GQL_ROOT, 'public/schema.graphql')
  const privateSchemaPath = path.join(GQL_ROOT, 'private/schema.graphql')
  const publicTypeDefs = mergeSchemas({
    schemas: [],
    typeDefs
  })

  const publicSchema = nestLinear(nestGitLab(nestGitHub(publicTypeDefs).schema).schema).schema
  const privateSchema = mergeSchemas({schemas: [publicSchema], typeDefs: [privateTypeDefs]})

  await Promise.all([
    writeIfChanged(publicSchemaPath, printSchema(publicSchema)),
    writeIfChanged(privateSchemaPath, printSchema(privateSchema))
  ])
}

export default updateGQLSchema
