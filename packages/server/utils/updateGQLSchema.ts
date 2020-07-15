import {generateNamespace} from '@gql2ts/from-schema'
import {
  DEFAULT_ENUM_TYPE_BUILDER,
  DEFAULT_EXPORT_FUNCTION,
  DEFAULT_INTERFACE_BUILDER,
  DEFAULT_TYPE_BUILDER
} from '@gql2ts/language-typescript'
import fs from 'fs'
import {printSchema} from 'graphql'
import path from 'path'
import {promisify} from 'util'
import getProjectRoot from '../../../scripts/webpack/utils/getProjectRoot'

const write = promisify(fs.writeFile)
// relative to the output file
const PROJECT_ROOT = getProjectRoot()
const schemaPath = path.join(PROJECT_ROOT, 'schema.graphql')
const typesPath = path.join(PROJECT_ROOT, 'packages/client/types/graphql.ts')

const typesOverrides = {
  generateNamespace: (_, interfaces) => `// AUTOMATICALLY GENERATED FILE - DO NOT EDIT

  // tslint:disable

  ${interfaces}

  // tslint:enable
  `,
  interfaceBuilder: (name, body) => DEFAULT_EXPORT_FUNCTION(DEFAULT_INTERFACE_BUILDER(name, body)),
  typeBuilder: (name, body) => DEFAULT_EXPORT_FUNCTION(DEFAULT_TYPE_BUILDER(name, body)),
  enumTypeBuilder: (name, values) =>
    DEFAULT_EXPORT_FUNCTION(DEFAULT_ENUM_TYPE_BUILDER(name, values))
}

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
      // very important to require this so it's the latest version
      const schema = require('../graphql/rootSchema').default
      const nextSchema = printSchema(schema)
      if (context.oldSchema === nextSchema) return
      context.oldSchema = nextSchema
      const gqlTypes = generateNamespace('GQL', nextSchema, {}, typesOverrides)
      await Promise.all([write(schemaPath, nextSchema), write(typesPath, gqlTypes)])
      // console.log(`💥💥💥   GraphQL Schema Created    💥💥💥`)
      resolve(true)
    }, context.delay)
  })
}

export default updateGQLSchema
