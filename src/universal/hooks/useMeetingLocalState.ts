import {Dispatch, SetStateAction, useEffect, useRef, useState} from 'react'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useRouter from 'universal/hooks/useRouter'
import findKeyByValue from 'universal/utils/findKeyByValue'
import findStageById from 'universal/utils/meetings/findStageById'
import fromStageIdToUrl, {FromStageIdToUrlPhase} from 'universal/utils/meetings/fromStageIdToUrl'
import getMeetingPathParams from 'universal/utils/meetings/getMeetingPathParams'
import {meetingTypeToSlug, phaseTypeToSlug} from 'universal/utils/meetings/lookups'
import updateLocalStage from 'universal/utils/relay/updateLocalStage'

interface ItemStage {
  isNavigable: boolean
  isNavigableByFacilitator: boolean
}

interface Phase extends FromStageIdToUrlPhase {
  stages: ReadonlyArray<ItemStage & FromStageIdToUrlPhase['stages'][0]>
}

interface SafeNewMeeting {
  facilitatorStageId: string
  facilitatorUserId: string
  localStage: {
    id: string
  }
  id: string
  phases: ReadonlyArray<Phase>
}

export interface SafeTeam {
  newMeeting: SafeNewMeeting | null
}

const useInitialSafeRoute = (
  setSafeRoute: Dispatch<SetStateAction<boolean>>,
  team: SafeTeam | null
) => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  useEffect(() => {
    /*
     * Computing location depends on 3 binary variables: going to lobby, local stage exists (exit/reenter), meeting is active
     * the additional logic here has 2 benefits:
     *  1) no need for validation inside phase components
     *  2) guaranteed 1 redirect maximum (no URL flickering)
     */
    const meetingPath = getMeetingPathParams()
    const {meetingType, phaseSlug, stageIdxSlug, teamId} = meetingPath
    if (!meetingType || !teamId) {
      setSafeRoute(false)
      return
    }
    if (!team) {
      history.replace({
        pathname: `/invitation-required/${teamId}`,
        search: `?redirectTo=${encodeURIComponent(window.location.pathname)}`
      })
      setSafeRoute(false)
      return
    }
    const {newMeeting} = team
    const meetingSlug = meetingTypeToSlug[meetingType]
    const {viewerId} = atmosphere

    // i'm trying to go to the lobby and there's no active meeting
    if (!phaseSlug && !newMeeting) {
      setSafeRoute(true)
      return
    }

    // i'm trying to go to the middle of a meeting that hasn't started
    if (!newMeeting) {
      history.replace(`/${meetingSlug}/${teamId}`)
      setSafeRoute(false)
      return
    }

    const {facilitatorStageId, facilitatorUserId, localStage, id: meetingId, phases} = newMeeting

    // i'm headed to the lobby but the meeting is already going, send me there
    if (localStage && !phaseSlug) {
      const {id: localStageId} = localStage
      const nextUrl = fromStageIdToUrl(localStageId, phases)
      history.replace(nextUrl)
      setSafeRoute(false)
      return
    }

    const localPhaseType = findKeyByValue(phaseTypeToSlug, phaseSlug)
    const stageIdx = stageIdxSlug ? Number(stageIdxSlug) - 1 : 0

    const phase = phases.find((curPhase) => curPhase.phaseType === localPhaseType)
    if (!phase) {
      // typo in url, send to the facilitator
      const nextUrl = fromStageIdToUrl(facilitatorStageId, phases)
      history.replace(nextUrl)
      updateLocalStage(atmosphere, meetingId, facilitatorStageId)
      setSafeRoute(false)
      return
    }
    const stage = phase.stages[stageIdx]
    const stageId = stage && stage.id
    const isViewerFacilitator = viewerId === facilitatorUserId
    const itemStage = findStageById(phases, stageId)
    if (!itemStage) {
      // useful for e.g. /discuss/2, especially on the demo
      const nextUrl = teamId ? `/${meetingSlug}/${teamId}` : '/retrospective-demo/reflect'
      updateLocalStage(atmosphere, meetingId, facilitatorStageId)
      history.replace(nextUrl)
      setSafeRoute(false)
      return
    }
    const {
      stage: {isNavigable, isNavigableByFacilitator}
    } = itemStage
    const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
    if (!canNavigate) {
      // too early to visit meeting or typo, go to facilitator
      const nextUrl = fromStageIdToUrl(facilitatorStageId, phases)
      history.replace(nextUrl)
      updateLocalStage(atmosphere, meetingId, facilitatorStageId)
      setSafeRoute(false)
      return
    }

    // legit URL!
    updateLocalStage(atmosphere, meetingId, stage.id)
    setSafeRoute(true)
  }, [])
}

const useUpdatedSafeRoute = (
  setSafeRoute: Dispatch<SetStateAction<boolean>>,
  team: SafeTeam | null
) => {
  const {history} = useRouter()
  const oldMeetingRef = useRef(team && team.newMeeting)
  useEffect(() => {
    const newMeeting = team && team.newMeeting
    const {current: oldMeeting} = oldMeetingRef
    if (newMeeting === oldMeeting) return
    const localStageId = (newMeeting && newMeeting.localStage && newMeeting.localStage.id) || ''
    const oldLocalStageId = oldMeeting && oldMeeting.localStage && oldMeeting.localStage.id
    if (localStageId !== oldLocalStageId) {
      const meetingPath = getMeetingPathParams()
      const {meetingSlug, teamId} = meetingPath
      if (!meetingSlug || !teamId) {
        setSafeRoute(false)
        return
      }
      if (!newMeeting) {
        // goto lobby
        history.replace(`/${meetingSlug}/${teamId}`)
        return
      }
      const {phases} = newMeeting
      const nextUrl = fromStageIdToUrl(localStageId, phases)
      history.replace(nextUrl)
    }
    setSafeRoute(true)
  })
}

const useMeetingLocalState = (team: SafeTeam | null) => {
  const [safeRoute, setSafeRoute] = useState(false)
  useInitialSafeRoute(setSafeRoute, team)
  useUpdatedSafeRoute(setSafeRoute, team)
  return safeRoute
}

export default useMeetingLocalState
