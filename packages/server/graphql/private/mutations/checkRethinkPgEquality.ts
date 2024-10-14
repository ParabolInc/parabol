import getRethink from '../../../database/rethinkDriver'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import {selectNewMeetings} from '../../../postgres/select'
import {checkRowCount, checkTableEq} from '../../../postgres/utils/checkEqBase'
import {
  compareDateAlmostEqual,
  compareRValStringAsNumber,
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

  if (tableName === 'NewMeeting') {
    const rowCountResult = await checkRowCount(tableName)
    const rethinkQuery = (updatedAt: Date, id: string | number) => {
      return r
        .table('NewMeeting' as any)
        .between([updatedAt, id], [r.maxval, r.maxval], {
          index: 'updatedAtId',
          leftBound: 'open',
          rightBound: 'closed'
        })
        .orderBy({index: 'updatedAtId'}) as any
    }
    const pgQuery = async (ids: string[]) => {
      return selectNewMeetings().where('id', 'in', ids).execute()
    }
    const errors = await checkTableEq(
      rethinkQuery,
      pgQuery,
      {
        id: defaultEqFn,
        isLegacy: compareRValUndefinedAsFalse,
        createdAt: compareDateAlmostEqual,
        updatedAt: compareDateAlmostEqual,
        createdBy: defaultEqFn,
        endedAt: compareRValUndefinedAsNull,
        facilitatorStageId: defaultEqFn,
        facilitatorUserId: defaultEqFn,
        meetingCount: compareRValUndefinedAsZero,
        meetingNumber: compareRValUndefinedAsZero,
        name: compareRValUndefinedAsNullAndTruncateRVal(100),
        summarySentAt: compareRValUndefinedAsNull,
        teamId: defaultEqFn,
        meetingType: defaultEqFn,
        phases: defaultEqFn,
        showConversionModal: compareRValUndefinedAsFalse,
        meetingSeriesId: compareRValUndefinedAsNull,
        scheduledEndTime: compareRValUndefinedAsNull,
        summary: compareRValUndefinedAsNullAndTruncateRVal(10000),
        sentimentScore: compareRValUndefinedAsNull,
        usedReactjis: compareRValUndefinedAsNull,
        slackTs: compareRValStringAsNumber,
        engagement: compareRValUndefinedAsNull,
        totalVotes: compareRValUndefinedAsNull,
        maxVotesPerGroup: compareRValUndefinedAsNull,
        disableAnonymity: compareRValUndefinedAsNull,
        commentCount: compareRValUndefinedAsNull,
        taskCount: compareRValUndefinedAsNull,
        agendaItemCount: compareRValUndefinedAsNull,
        storyCount: compareRValUndefinedAsNull,
        templateId: compareRValUndefinedAsNull,
        topicCount: compareRValUndefinedAsNull,
        reflectionCount: compareRValUndefinedAsNull,
        transcription: compareRValUndefinedAsNull,
        recallBotId: compareRValUndefinedAsNull,
        videoMeetingURL: compareRValUndefinedAsNull,
        autogroupReflectionGroups: compareRValUndefinedAsNull,
        resetReflectionGroups: compareRValUndefinedAsNull,
        templateRefId: compareRValUndefinedAsNull,
        meetingPrompt: compareRValUndefinedAsNull
      },
      maxErrors
    )
    return handleResult(tableName, rowCountResult, errors, writeToFile)
  }
  return 'Table not found'
}

export default checkRethinkPgEquality
