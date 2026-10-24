import {GraphQLError} from 'graphql'
import {readReportSpec} from '../../client/shared/reports/parseReportSpec'
import {validateReportSpec} from '../../client/shared/reports/validateReportSpec'
import type {ReportSpecInput} from '../graphql/public/resolverTypes'

const readReportSpecInput = (input: ReportSpecInput) => {
  const spec = readReportSpec(input)
  const problem = spec ? validateReportSpec(spec) : 'That isn’t a report spec'
  if (!spec || problem) throw new GraphQLError(problem ?? 'That isn’t a report spec')
  return spec
}

export default readReportSpecInput
