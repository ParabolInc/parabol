import getRethink from '../../../database/rethinkDriver'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import getKysely from '../../../postgres/getKysely'
import {checkRowCount, checkTableEq} from '../../../postgres/utils/checkEqBase'
import {
  compareDateAlmostEqual,
  compareRValOptionalPluckedObject,
  compareRValStringAsNumber,
  compareRValUndefinedAsEmptyArray,
  compareRValUndefinedAsFalse,
  compareRValUndefinedAsNull,
  compareRValUndefinedAsNullAndTruncateRVal,
  compareRValUndefinedAsZero,
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

  if (tableName === 'Organization') {
    const rowCountResult = await checkRowCount(tableName)
    const rethinkQuery = (updatedAt: Date, id: string | number) => {
      return r
        .table('Organization' as any)
        .between([updatedAt, id], [r.maxval, r.maxval], {
          index: 'updatedAtId',
          leftBound: 'open',
          rightBound: 'closed'
        })
        .orderBy({index: 'updatedAtId'}) as any
    }
    const pgQuery = async (ids: string[]) => {
      return getKysely()
        .selectFrom('Organization')
        .selectAll()
        .select(({fn}) => [fn('to_json', ['creditCard']).as('creditCard')])
        .where('id', 'in', ids)
        .execute()
    }
    const errors = await checkTableEq(
      rethinkQuery,
      pgQuery,
      {
        id: defaultEqFn,
        activeDomain: compareRValUndefinedAsNullAndTruncateRVal(100),
        isActiveDomainTouched: compareRValUndefinedAsFalse,
        creditCard: compareRValOptionalPluckedObject({
          brand: compareRValUndefinedAsNull,
          expiry: compareRValUndefinedAsNull,
          last4: compareRValStringAsNumber
        }),
        createdAt: defaultEqFn,
        name: compareRValUndefinedAsNullAndTruncateRVal(100),
        payLaterClickCount: compareRValUndefinedAsZero,
        periodEnd: compareRValUndefinedAsNull,
        periodStart: compareRValUndefinedAsNull,
        picture: compareRValUndefinedAsNull,
        showConversionModal: compareRValUndefinedAsFalse,
        stripeId: compareRValUndefinedAsNull,
        stripeSubscriptionId: compareRValUndefinedAsNull,
        upcomingInvoiceEmailSentAt: compareRValUndefinedAsNull,
        tier: defaultEqFn,
        tierLimitExceededAt: compareRValUndefinedAsNull,
        trialStartDate: compareRValUndefinedAsNull,
        scheduledLockAt: compareRValUndefinedAsNull,
        lockedAt: compareRValUndefinedAsNull,
        updatedAt: compareDateAlmostEqual,
        featureFlags: compareRValUndefinedAsEmptyArray
      },
      maxErrors
    )
    return handleResult(tableName, rowCountResult, errors, writeToFile)
  }
  return 'Table not found'
}

export default checkRethinkPgEquality
