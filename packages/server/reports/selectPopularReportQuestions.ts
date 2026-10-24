import {parseReportSpec} from '../../client/shared/reports/parseReportSpec'
import getKysely from '../postgres/getKysely'

// A question whose stored spec no longer parses, say after a dimension was removed, is left out
const selectPopularReportQuestions = async () => {
  const questions = await getKysely()
    .selectFrom('PopularReportQuestion')
    .select([
      'id',
      'key',
      'subject',
      'title',
      'question',
      'description',
      'spec',
      'defaultPinSortOrder'
    ])
    .where('retiredAt', 'is', null)
    .orderBy('sortOrder')
    .execute()
  return questions.flatMap(({spec, ...question}) => {
    const parsedSpec = parseReportSpec(spec)
    return parsedSpec ? [{...question, spec: parsedSpec}] : []
  })
}

export type PopularReportQuestionRow = Awaited<
  ReturnType<typeof selectPopularReportQuestions>
>[number]

export default selectPopularReportQuestions
