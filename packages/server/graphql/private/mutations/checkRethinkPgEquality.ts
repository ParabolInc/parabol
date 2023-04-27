import fs from 'fs'
import path from 'path'
import getRethink from '../../../database/rethinkDriver'
import getMeetingTemplatesByIds from '../../../postgres/queries/getMeetingTemplatesByIds'
import {checkRowCount, checkTableEq} from '../../../postgres/utils/checkEqBase'
import {
  compareDateAlmostEqual,
  compareRValUndefinedAsFalse,
  compareRValUndefinedAsNull,
  defaultEqFn
} from '../../../postgres/utils/rethinkEqualityFns'
import {MutationResolvers} from '../resolverTypes'

const handleResult = async (
  tableName: string,
  rowCountResult: string,
  errors: any[],
  writeToFile: boolean | undefined | null
) => {
  const result = [rowCountResult, ...errors]
  const resultStr = JSON.stringify(result)
  if (!writeToFile) return resultStr

  const fileName = `${tableName}-${new Date()}`
  const fileDir = path.join(process.cwd(), '__rethinkEquality__')
  const fileLocation = path.join(fileDir, fileName)
  await fs.promises.mkdir(fileDir, {recursive: true})
  await fs.promises.writeFile(fileLocation, resultStr)
  return `Result written to ${fileLocation}`
}

const checkRethinkPgEquality: MutationResolvers['checkRethinkPgEquality'] = async (
  _source,
  {tableName, writeToFile}
) => {
  const r = await getRethink()

  if (tableName === 'MeetingTemplate') {
    const rowCountResult = await checkRowCount(tableName)
    const rethinkQuery = r.table('MeetingTemplate').orderBy('updatedAt', {index: 'updatedAt'})
    const errors = await checkTableEq(rethinkQuery, getMeetingTemplatesByIds, {
      createdAt: defaultEqFn,
      isActive: defaultEqFn,
      name: defaultEqFn,
      teamId: defaultEqFn,
      updatedAt: compareDateAlmostEqual,
      scope: defaultEqFn,
      orgId: defaultEqFn,
      parentTemplateId: compareRValUndefinedAsNull,
      lastUsedAt: compareRValUndefinedAsNull,
      type: defaultEqFn,
      isStarter: compareRValUndefinedAsFalse,
      isFree: compareRValUndefinedAsFalse
    })
    return handleResult(tableName, rowCountResult, errors, writeToFile)
  }
  return 'Table not found'
}

export default checkRethinkPgEquality
