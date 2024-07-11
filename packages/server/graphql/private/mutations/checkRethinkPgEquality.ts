import getRethink from '../../../database/rethinkDriver'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import getKysely from '../../../postgres/getKysely'
import {checkRowCount, checkTableEq} from '../../../postgres/utils/checkEqBase'
import {compareRValUndefinedAsNull, defaultEqFn} from '../../../postgres/utils/rethinkEqualityFns'
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

  const fileName = `rethinkdbEquality_${tableName}_${new Date().toISOString()}.json`
  const manager = getFileStoreManager()
  const buffer = Buffer.from(resultStr, 'utf-8')
  return manager.putDebugFile(buffer, fileName)
}

const checkRethinkPgEquality: MutationResolvers['checkRethinkPgEquality'] = async (
  _source,
  {tableName, writeToFile, maxErrors}
) => {
  const r = await getRethink()

  if (tableName === 'OrganizationUser') {
    const rowCountResult = await checkRowCount(tableName)
    const rethinkQuery = (joinedAt: Date, id: string | number) => {
      return r
        .table('OrganizationUser' as any)
        .between([joinedAt, id], [r.maxval, r.maxval], {
          index: 'joinedAtId',
          leftBound: 'open',
          rightBound: 'closed'
        })
        .orderBy({index: 'joinedAtId'}) as any
    }
    const pgQuery = async (ids: string[]) => {
      return getKysely().selectFrom('OrganizationUser').selectAll().where('id', 'in', ids).execute()
    }
    const errors = await checkTableEq(
      rethinkQuery,
      pgQuery,
      {
        id: defaultEqFn,
        suggestedTier: compareRValUndefinedAsNull,
        inactive: defaultEqFn,
        joinedAt: defaultEqFn,
        orgId: defaultEqFn,
        removedAt: defaultEqFn,
        role: compareRValUndefinedAsNull,
        userId: defaultEqFn,
        tier: defaultEqFn,
        trialStartDate: compareRValUndefinedAsNull
      },
      maxErrors
    )
    return handleResult(tableName, rowCountResult, errors, writeToFile)
  }
  return 'Table not found'
}

export default checkRethinkPgEquality
