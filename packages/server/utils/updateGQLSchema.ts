import fs from 'fs'
import {printSchema} from 'graphql'
import path from 'path'
import {promisify} from 'util'
import getProjectRoot from '../../../scripts/webpack/utils/getProjectRoot'

const write = promisify(fs.writeFile)
// relative to the output file
const PROJECT_ROOT = getProjectRoot()
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
      // very important to require this so it's the latest version
      const schema = require('../graphql/rootSchema').default
      const nextSchema = printSchema(schema)
      console.log("maybe writing schema")
      if (context.oldSchema === nextSchema) return
      context.oldSchema = nextSchema
      console.log('writing new schema')
      await write(schemaPath, nextSchema)
      // console.log(`💥💥💥   GraphQL Schema Created    💥💥💥`)
      resolve(true)
    }, context.delay)
  })
}

export default updateGQLSchema
