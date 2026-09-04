/**
 * Data + mutations for the Manage group modal (design 2a).
 *
 * Drop-in location: packages/client/components/ManageMeetingSeriesGroupModalRoot.tsx
 *
 * Lists every team in the org that owns the group. A checked row means that team has an active
 * series in this group; checking a row starts/schedules the series for that team, unchecking
 * cancels it. Enter-meeting and permalink actions are per-team.
 */
import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import {useNavigate} from 'react-router'
import type {ManageMeetingSeriesGroupModalRootQuery} from '../__generated__/ManageMeetingSeriesGroupModalRootQuery.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdateMeetingSeriesMutation from '../mutations/UpdateMeetingSeriesMutation'
import useStartTeamHealthMutation from '../mutations/useStartTeamHealthMutation'
import makeAppURL from '../utils/makeAppURL'
import {type ManageGroupTeam, ManageMeetingSeriesGroupModal} from './ManageMeetingSeriesGroupModal'

interface GroupSeries {
  id: string
  teamId: string
  title: string
  urlSlug: string
  recurrenceRule: string
  activeMeetings: readonly {readonly id: string; readonly teamId: string}[]
  /** only present for teamHealth series; required to add a team to the group */
  templateId?: string | null
}

interface Props {
  isOpen: boolean
  onClose: () => void
  seriesRefs: readonly GroupSeries[]
  /** human-readable recurrence, e.g. "every 2 weeks on Monday at 9:00 AM" */
  recurrenceLabel: string
}

const query = graphql`
  query ManageMeetingSeriesGroupModalRootQuery($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        id
        orgId
        organization {
          id
          name
          teams {
            id
            name
            isViewerOnTeam
          }
        }
      }
    }
  }
`

const ManageMeetingSeriesGroupModalRoot = (props: Props) => {
  const {isOpen, onClose, seriesRefs, recurrenceLabel} = props
  const firstSeries = seriesRefs[0]!
  const data = useLazyLoadQuery<ManageMeetingSeriesGroupModalRootQuery>(query, {
    teamId: firstSeries.teamId
  })
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const {onError, onCompleted} = useMutationProps()
  const [startTeamHealth] = useStartTeamHealthMutation()
  const organization = data.viewer.team?.organization
  const orgTeams = organization?.teams ?? []

  const seriesByTeamId = new Map(seriesRefs.map((series) => [series.teamId, series]))
  const teams: ManageGroupTeam[] = orgTeams.map((team) => {
    const series = seriesByTeamId.get(team.id)
    const meeting = series?.activeMeetings.find((m) => m.teamId === team.id)
    return {
      id: team.id,
      name: team.name,
      isViewerOnTeam: team.isViewerOnTeam,
      inSeries: !!series,
      seriesId: series?.id ?? null,
      urlSlug: series?.urlSlug ?? null,
      meetingId: meeting?.id ?? null
    }
  })

  const onSave = (teamIdsInSeries: string[]) => {
    const nextIds = new Set(teamIdsInSeries)
    const removed = seriesRefs.filter((series) => !nextIds.has(series.teamId))
    const addedTeamIds = teamIdsInSeries.filter((teamId) => !seriesByTeamId.has(teamId))

    removed.forEach((series) => {
      UpdateMeetingSeriesMutation(
        atmosphere,
        {meetingSeriesId: series.id, rrule: null},
        {onError, onCompleted}
      )
    })

    const {templateId} = firstSeries
    if (addedTeamIds.length > 0 && templateId) {
      startTeamHealth({
        variables: {
          teamIds: addedTeamIds,
          templateId,
          name: firstSeries.title,
          rrule: firstSeries.recurrenceRule
        }
      })
    }

    if (removed.length > 0 || addedTeamIds.length > 0) {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'manageMeetingSeriesGroup',
        autoDismiss: 5,
        showDismissButton: true,
        message: `Updated ${firstSeries.title} • ${addedTeamIds.length} added, ${removed.length} removed`
      })
    }
  }

  const onEnterMeeting = (team: ManageGroupTeam) => {
    if (!team.meetingId) return
    navigate(`/meet/${team.meetingId}`)
  }

  const onCopyPermalink = async (team: ManageGroupTeam) => {
    if (!team.urlSlug) return
    const copyUrl = makeAppURL(window.location.origin, `meeting-series/${team.urlSlug}`)
    await navigator.clipboard.writeText(copyUrl)
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: `copyMeetingSeriesLink:${team.id}`,
      autoDismiss: 3,
      message: `Copied the ${team.name} meeting permalink`
    })
  }

  return (
    <ManageMeetingSeriesGroupModal
      isOpen={isOpen}
      onClose={onClose}
      seriesTitle={firstSeries.title}
      scheduleLabel={recurrenceLabel}
      orgName={organization?.name ?? 'this organization'}
      teams={teams}
      onSave={onSave}
      onEnterMeeting={onEnterMeeting}
      onCopyPermalink={onCopyPermalink}
    />
  )
}

export default ManageMeetingSeriesGroupModalRoot
