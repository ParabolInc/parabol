import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql'
import {requireSU} from '../../../utils/authorization'
import fs from 'fs'
import path from 'path'
import checkUserEq from '../../../postgres/utils/checkUserEq'
import checkTeamEq from '../../../postgres/utils/checkTeamEq'

const tableResolvers = {
  User: checkUserEq,
  Team: checkTeamEq
} as {[key: string]: (
  pageSize?: number,
  startPage?: number,
  slice?: boolean
) => Promise<{[key: string]: any}>}

const checkEqAndWriteOutput = async (
  tableName: string,
  fileLocation: string,
  pageSize?: number,
  startPage?: number,
  slice?: boolean,
): Promise<void> => {
  const errors = await tableResolvers[tableName](
    pageSize,
    startPage,
    slice
  )
  await fs.promises.writeFile(fileLocation, JSON.stringify(errors))
}

const checkRethinkPgEquality = {
  type: GraphQLNonNull(GraphQLString),
  description: 'check equality of a table between rethinkdb and postgres',
  args: {
    tableName: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The table name to be compared'
    },
    slice: {
      type: GraphQLBoolean,
      default: true,
      description: 'Whether a slice of the data should be compared'
    },
    pageSize: {
      type: GraphQLInt,
      default: 3000,
      description: 'How many results each "page" should contain'
    },
    startPage: {
      type: GraphQLInt,
      default: 0,
      description: 'The "page" of where to start comparing within the dataset'
    }
  },
  resolve: async (
    _source,
    {tableName, slice, pageSize, startPage},
    {authToken}
  ) => {
    // AUTH
    requireSU(authToken)

    // VALIDATION
    if (!tableResolvers.hasOwnProperty(tableName)) {
      return `That table name either doesn't exist or hasn't yet been implemented.`
    }
    if (pageSize && pageSize > 3000) {
      return `Page size must not exceed 3000`
    }

    // RESOLUTION
    slice = slice ?? true
    if (slice) {
      const errors = await tableResolvers[tableName](
        pageSize,
        startPage,
        slice
      )
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
    checkEqAndWriteOutput(
      tableName,
      fileLocation,
      pageSize,
      startPage,
      slice
    )
    return `Please check ${fileLocation} for output results, it will appear in a few mins.`
  }
}

export default checkRethinkPgEquality
