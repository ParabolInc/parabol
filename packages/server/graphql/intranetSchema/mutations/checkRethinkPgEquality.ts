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
  pageSize?: number,
  startPage?: number,
  slice?: boolean
): Promise<void> => {
  const errors = await tableResolvers[tableName](pageSize, startPage, slice)
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
    numberOfRecords: {
      type: GraphQLInt,
      default: 3000,
      description: 'The number of records requested'
    },
    startPage: {
      type: GraphQLInt,
      default: 0,
      description: 'The "page" of where to start comparing within the dataset'
    },
    writeToFile: {
      type: GraphQLBoolean,
      default: false,
      description: 'Whether the output should be written to file'
    }
  },
  resolve: async (_source, {tableName, numberOfRecords, startPage, writeToFile}, {authToken}) => {
    // AUTH
    requireSU(authToken)

    // VALIDATION
    if (!tableResolvers.hasOwnProperty(tableName)) {
      return `That table name either doesn't exist or hasn't yet been implemented.`
    }
    if (numberOfRecords && numberOfRecords > 3000) {
      return `Number of records must not exceed 3000`
    }

    // RESOLUTION
    if (!writeToFile) {
      const errors = await tableResolvers[tableName](numberOfRecords, startPage)
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
    checkEqAndWriteOutput(tableName, fileLocation, numberOfRecords, startPage)
    return `Please check ${fileLocation} for output results, it will appear in a few mins.`
  }
}

export default checkRethinkPgEquality
