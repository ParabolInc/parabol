import {GQLContext} from './../../graphql'
import {GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLString} from 'graphql'
import {requireSU} from '../../../utils/authorization'
import fs from 'fs'
import path from 'path'
import checkUserEq from '../../../postgres/utils/checkUserEq'
import checkTeamEq from '../../../postgres/utils/checkTeamEq'

const tableResolvers = {
  User: checkUserEq,
  Team: checkTeamEq
} as {
  [key: string]: (
    pageSize?: number,
    startPage?: number,
    slice?: boolean
  ) => Promise<{[key: string]: any}>
}

const checkEqAndWriteOutput = async (
  tableName: string,
  fileLocation: string,
  maxErrors = 10
): Promise<void> => {
  const errors = await tableResolvers[tableName]!(maxErrors)
  await fs.promises.writeFile(fileLocation, JSON.stringify(errors))
}

const checkRethinkPgEquality = {
  type: new GraphQLNonNull(GraphQLString),
  description: 'check equality of a table between rethinkdb and postgres',
  args: {
    tableName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The table name to be compared'
    },
    maxErrors: {
      type: GraphQLInt,
      default: 10,
      description: 'How many errors should be returned'
    },
    writeToFile: {
      type: GraphQLBoolean,
      default: false,
      description: 'Whether the output should be written to file'
    }
  },
  resolve: async (
    _source: unknown,
    {
      tableName,
      maxErrors,
      writeToFile
    }: {tableName: string; maxErrors?: number; writeToFile?: boolean},
    {authToken}: GQLContext
  ) => {
    // AUTH
    requireSU(authToken)

    // VALIDATION
    const tableResolver = tableResolvers[tableName]
    if (!tableResolver) {
      return `That table name either doesn't exist or hasn't yet been implemented.`
    }

    // RESOLUTION
    if (!writeToFile) {
      const errors = await tableResolver(maxErrors)
      return JSON.stringify(errors)
    }
    const fileName = `${tableName}-${new Date()}`
    const fileLocation = path.join(
      process.cwd(),
      'packages/server/graphql/intranetSchema/mutations',
      '__output__',
      fileName
    )
    await fs.promises.mkdir(path.dirname(fileLocation), {recursive: true})
    checkEqAndWriteOutput(tableName, fileLocation, maxErrors)
    return `Please check ${fileLocation} for output results, it will appear in a few mins.`
  }
}

export default checkRethinkPgEquality
