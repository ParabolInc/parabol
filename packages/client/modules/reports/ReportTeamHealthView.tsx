import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ReportTeamHealthView_teamHealth$key} from '../../__generated__/ReportTeamHealthView_teamHealth.graphql'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import ReportTeamHealthHeatmap from './ReportTeamHealthHeatmap'
import type {ReportRowTotal} from './reportHeatmapGrid'
import type {ReportResultRow} from './reportRows'
import type {ReportTeamHealthAllTeamsRows} from './reportTeamHealthRows'

interface Props {
  orgId: string
  spec: ReportSpec
  rowHeading: string
  rows: readonly ReportResultRow[]
  rowTotals: readonly ReportRowTotal[]
  teamHealthRef: ReportTeamHealthView_teamHealth$key
  allTeamsRows: ReportTeamHealthAllTeamsRows
}

const ReportTeamHealthView = (props: Props) => {
  const {teamHealthRef, ...heatmapProps} = props
  const teamHealth = useFragment(
    graphql`
      fragment ReportTeamHealthView_teamHealth on ReportTeamHealth {
        checks {
          meetingId
          teamId
          endedAt
          checkNumber
          respondentCount
          memberCount
          categories {
            categoryId
            respondentCount
            commenterCount
            deviation
            sentimentScore
            isLoadingSummary
            previousScores
          }
        }
      }
    `,
    teamHealthRef
  )
  return <ReportTeamHealthHeatmap {...heatmapProps} checks={teamHealth.checks} />
}

export default ReportTeamHealthView
