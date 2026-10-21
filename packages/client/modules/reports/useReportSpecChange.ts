import {useNavigate} from 'react-router'
import useStartReportQuestionMutation from '../../mutations/useStartReportQuestionMutation'
import type {ReportSpec} from '../../shared/reports/reportCatalog'

// An edit keeps the report's question and records the spec as used, or starts a builder question for a
// report that had none
const useReportSpecChange = (
  orgId: string,
  reportQuestionId: string | null,
  toPath: (spec: ReportSpec, reportQuestionId: string | null) => string
) => {
  const navigate = useNavigate()
  const [start] = useStartReportQuestionMutation()
  return (nextSpec: ReportSpec, nextTitle: string) => {
    const nextPath = toPath(nextSpec, reportQuestionId)
    navigate(nextPath, {replace: true})
    start({
      variables: reportQuestionId
        ? {orgId, reportQuestionId, spec: nextSpec}
        : {orgId, spec: nextSpec, title: nextTitle},
      onCompleted: (response) => {
        const builtId = response.startReportQuestion?.reportQuestion.id
        // a reply that lands after another edit, or after leaving the report, must not navigate
        const isStillShown = `${window.location.pathname}${window.location.search}` === nextPath
        if (!reportQuestionId && builtId && isStillShown) {
          navigate(toPath(nextSpec, builtId), {replace: true})
        }
      }
    })
  }
}

export default useReportSpecChange
