import fs from 'fs'
import path from 'path'
import checkTeamEq from '../../../postgres/utils/checkTeamEq'
import checkUserEq from '../../../postgres/utils/checkUserEq'
import {requireSU} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

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

const checkRethinkPgEquality: MutationResolvers['checkRethinkPgEquality'] = async (
  _source,
  {tableName, maxErrors, writeToFile},
  {authToken}
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
    'packages/server/graphql/private/mutations',
    '__output__',
    fileName
  )
  await fs.promises.mkdir(path.dirname(fileLocation), {recursive: true})
  checkEqAndWriteOutput(tableName, fileLocation, maxErrors)
  return `Please check ${fileLocation} for output results, it will appear in a few mins.`
}

export default checkRethinkPgEquality
