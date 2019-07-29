import {useMeetingLocalStateTeam} from '../__generated__/useMeetingLocalStateTeam.graphql'
import {Dispatch, SetStateAction, useEffect, useRef, useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import useAtmosphere from './useAtmosphere'
import useRouter from './useRouter'
import findKeyByValue from '../utils/findKeyByValue'
import findStageById from '../utils/meetings/findStageById'
import fromStageIdToUrl from '../utils/meetings/fromStageIdToUrl'
import getMeetingPathParams from '../utils/meetings/getMeetingPathParams'
import {meetingTypeToSlug, phaseTypeToSlug} from '../utils/meetings/lookups'
import updateLocalStage from '../utils/relay/updateLocalStage'

const useInitialSafeRoute = (
  setSafeRoute: Dispatch<SetStateAction<boolean>>,
  team: useMeetingLocalStateTeam | null
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
      const nextUrl = fromStageIdToUrl(localStageId, phases, facilitatorStageId)
      history.replace(nextUrl)
      updateLocalStage(atmosphere, meetingId, facilitatorStageId)
      setSafeRoute(false)
      return
    }

    const localPhaseType = findKeyByValue(phaseTypeToSlug, phaseSlug)
    const stageIdx = stageIdxSlug ? Number(stageIdxSlug) - 1 : 0

    const phase = phases.find((curPhase) => curPhase.phaseType === localPhaseType)
    if (!phase) {
      // typo in url, send to the facilitator
      const nextUrl = fromStageIdToUrl(facilitatorStageId, phases, facilitatorStageId)
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
      const nextUrl = fromStageIdToUrl(facilitatorStageId, phases, facilitatorStageId)
      history.replace(nextUrl)
      updateLocalStage(atmosphere, meetingId, facilitatorStageId)
      setSafeRoute(false)
      return
    }

    // legit URL!
    updateLocalStage(atmosphere, meetingId, stage.id)
    setSafeRoute(true)
  }, [/* eslint-disable-line react-hooks/exhaustive-deps */])
}

const useUpdatedSafeRoute = (
  setSafeRoute: Dispatch<SetStateAction<boolean>>,
  team: useMeetingLocalStateTeam | null
) => {
  const {history} = useRouter()
  const oldMeetingRef = useRef(team && team.newMeeting)
  const atmosphere = useAtmosphere()
  useEffect(() => {
    const newMeeting = team && team.newMeeting
    const {current: oldMeeting} = oldMeetingRef
    if (!newMeeting || newMeeting === oldMeeting) {
      // required. repro: enter meeting, click to team dash, go back to meeting
      setSafeRoute(true)
      return
    }
    const {localStage, localPhase, facilitatorStageId} = newMeeting
    const localStages = (localPhase && localPhase.stages) || null
    const localStageId = (localStage && localStage.id) || null
    const oldLocalStages =
      (oldMeeting && oldMeeting.localPhase && oldMeeting.localPhase.stages) || null
    const oldLocalStageId = oldMeeting && oldMeeting.localStage && oldMeeting.localStage.id
    oldMeetingRef.current = newMeeting
    // if the stage changes or the order of the stages changes, update the url
    const isNewLocalStageId = localStageId && localStageId !== oldLocalStageId
    const isUpdatedPhase = localStages !== oldLocalStages
    if (isNewLocalStageId || isUpdatedPhase) {
      const meetingPath = getMeetingPathParams()
      const {meetingSlug, teamId} = meetingPath
      if (!meetingSlug || !teamId) {
        setSafeRoute(false)
        return
      }
      if (!localStageId) {
        // goto lobby
        history.replace(`/${meetingSlug}/${teamId}`)
        // do not set as unsafe (repro: start meeting, end, start again)
        return
      }
      const {phases} = newMeeting
      if (isUpdatedPhase && !findStageById(phases, localStageId)) {
        // an item was removed and the local stage may be missing
        updateLocalStage(atmosphere, newMeeting.id, facilitatorStageId)
      }

      const nextPathname = fromStageIdToUrl(localStageId, phases, facilitatorStageId)
      if (nextPathname !== location.pathname) {
        history.replace(nextPathname)
        // do not set as unsafe (repro: start meeting, end, start again)
        return
      }
    }
    setSafeRoute(true)
  })
}

graphql`
  fragment useMeetingLocalStateTeam on Team {
    newMeeting {
      id
      facilitatorStageId
      facilitatorUserId
      localPhase {
        stages {
          id
        }
      }
      localStage {
        id
      }
      id
      phases {
        ...fromStageIdToUrlPhases @relay(mask: false)
        stages {
          isNavigable
          isNavigableByFacilitator
        }
      }
    }
  }
`
const useMeetingLocalState = (team: useMeetingLocalStateTeam | null) => {
  const [safeRoute, setSafeRoute] = useState(false)
  useInitialSafeRoute(setSafeRoute, team)
  useUpdatedSafeRoute(setSafeRoute, team)
  return safeRoute
}

export default useMeetingLocalState
