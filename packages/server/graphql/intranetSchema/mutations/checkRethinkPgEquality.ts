import {GraphQLNonNull, GraphQLString} from 'graphql'
import {requireSU} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import fs from 'fs'
import path from 'path'
import checkUserEq from '../../../postgres/utils/checkUserEq'
import checkTeamEq from '../../../postgres/utils/checkTeamEq'

const tableResolvers = {
  User: checkUserEq,
  Team: checkTeamEq
} as {[key: string]: () => Promise<{[key: string]: any}>}

const checkEqAndWriteOutput = async (tableName: string, fileLocation: string): Promise<void> => {
  const errors = await tableResolvers[tableName]()
  await fs.promises.writeFile(fileLocation, JSON.stringify(errors))
}

const checkRethinkPgEquality = {
  type: GraphQLNonNull(GraphQLString),
  description: 'check equality of a table between rethinkdb and postgres',
  args: {
    tableName: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The table name to be compared'
    }
  },
  resolve: async (_source, {tableName}, {authToken}) => {
    // AUTH
    requireSU(authToken)

    // VALIDATION
    if (!tableResolvers.hasOwnProperty(tableName)) {
      return standardError(
        new Error(`That table name either doesn't exist or hasn't yet been implemented.`)
      )
    }

    // RESOLUTION
    const fileName = `${tableName}-${new Date()}`
    const fileLocation = path.join(
      process.cwd(),
      'packages/server/graphql/intranetSchema/mutations',
      '__output__',
      fileName
    )
    await fs.promises.mkdir(path.dirname(fileLocation), {recursive: true})
    checkEqAndWriteOutput(tableName, fileLocation)
    return `Please check ${fileLocation} for output results, it will appear in a few mins.`
  }
}

export default checkRethinkPgEquality
