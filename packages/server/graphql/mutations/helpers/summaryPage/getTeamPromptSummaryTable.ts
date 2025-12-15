import {isNotNull} from '../../../../../client/utils/predicates'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import {getSummaryTable} from './getSummaryTable'

const headers = ['Author', 'Created at', 'Content'] as const

const getRowData = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const responses = await dataLoader.get('teamPromptResponsesByMeetingId').load(meetingId)

  const responseRows = await Promise.all(
    responses.map(async (response) => {
      const author =
        (response.userId && (await dataLoader.get('users').load(response.userId))?.preferredName) ??
        ''
      return {
        Author: author,
        'Created at': response.createdAt.toISOString(),
        Content: response.plaintextContent
      } as Record<(typeof headers)[number], string>
    })
  )

  return responseRows.filter(isNotNull)
}

export const getTeamPromptSummaryTable = async (
  meetingId: string,
  dataLoader: DataLoaderInstance
) => {
  const rowData = await getRowData(meetingId, dataLoader)
  console.log('GEORG summary', rowData)
  return getSummaryTable(headers, rowData)
}
