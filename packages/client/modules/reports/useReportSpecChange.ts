import {useNavigate} from 'react-router'
import useLogReportQuestionUseMutation from '../../mutations/useLogReportQuestionUseMutation'
import type {ReportSpec} from '../../shared/reports/reportCatalog'

// An edit records the changed report as one the viewer built, and moves to it once the server says which it is
const useReportSpecChange = (
  orgId: string,
  reportQuestionId: string | null,
  toPath: (spec: ReportSpec, reportQuestionId: string | null) => string
) => {
  const navigate = useNavigate()
  const [logUse] = useLogReportQuestionUseMutation()
  return (nextSpec: ReportSpec, nextTitle: string) => {
    const nextPath = toPath(nextSpec, reportQuestionId)
    navigate(nextPath, {replace: true})
    logUse({
      variables: {orgId, reportQuestionId, spec: nextSpec, title: nextTitle},
      onCompleted: (response) => {
        const builtId = response.logReportQuestionUse?.reportQuestion.id
        // a reply that lands after another edit, or after leaving the report, must not navigate
        const isStillShown = `${window.location.pathname}${window.location.search}` === nextPath
        if (builtId && builtId !== reportQuestionId && isStillShown) {
          navigate(toPath(nextSpec, builtId), {replace: true})
        }
      }
    })
  }
}

export default useReportSpecChange
