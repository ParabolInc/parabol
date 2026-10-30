import {GraphQLError} from 'graphql'
import {parseReportSpec} from '../../client/shared/reports/parseReportSpec'
import type {ReportSpecInput} from '../graphql/public/resolverTypes'

const readReportSpecInput = (input: ReportSpecInput) => {
  const {spec, problem} = parseReportSpec(input)
  if (!spec) throw new GraphQLError(problem)
  return spec
}

export default readReportSpecInput
