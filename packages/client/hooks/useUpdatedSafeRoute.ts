import {useNavigate, useRouter} from '@tanstack/react-router'
import graphql from 'babel-plugin-relay/macro'
import {type Dispatch, type SetStateAction, useEffect, useRef} from 'react'
import {readInlineData} from 'relay-runtime'
import type {useUpdatedSafeRoute_meeting$key} from '~/__generated__/useUpdatedSafeRoute_meeting.graphql'
import findStageById from '../utils/meetings/findStageById'
import fromStageIdToUrl from '../utils/meetings/fromStageIdToUrl'
import getMeetingPathParams from '../utils/meetings/getMeetingPathParams'
import getTeamHealthCheckShownInRetro from '../utils/meetings/getTeamHealthCheckShownInRetro'
import updateLocalStage from '../utils/relay/updateLocalStage'
import useAtmosphere from './useAtmosphere'

const useUpdatedSafeRoute = (
  setSafeRoute: Dispatch<SetStateAction<boolean>>,
  meetingRef: useUpdatedSafeRoute_meeting$key
) => {
  const navigate = useNavigate()
  const router = useRouter()
  const meeting = readInlineData(
    graphql`
      fragment useUpdatedSafeRoute_meeting on NewMeeting @inline {
        ...fromStageIdToUrl_meeting
        ...updateLocalStage_meeting
        id
        endedAt
        localStage {
          id
        }
        localPhase {
          id
          phaseType
          stages {
            id
          }
        }
        facilitatorStageId
        phases {
          id
          stages {
            id
          }
        }
        ... on RetrospectiveMeeting {
          teamHealthMeeting {
            endedAt
            localStage {
              id
            }
            phases {
              phaseType
              stages {
                id
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const oldMeetingRef = useRef(meeting)
  const atmosphere = useAtmosphere()
  useEffect(() => {
    const {current: oldMeeting} = oldMeetingRef
    if (meeting === oldMeeting) {
      // required. repro: enter meeting, click to team dash, go back to meeting
      setSafeRoute(true)
      return
    }
    const {localStage, localPhase, facilitatorStageId, phases} = meeting
    const localStages = localPhase?.stages ?? null
    const localStageId = localStage?.id ?? null
    const oldLocalStages = oldMeeting?.localPhase?.stages ?? null
    const oldLocalStageId = oldMeeting?.localStage?.id
    oldMeetingRef.current = meeting
    const getCheckStageId = (shownMeeting: typeof meeting) =>
      shownMeeting.localPhase?.phaseType === 'TEAM_HEALTH'
        ? getTeamHealthCheckShownInRetro(shownMeeting)?.localStage?.id
        : undefined
    // if the stage changes or the order of the stages changes, update the url. A retro's Team Health
    // phase shows its check, whose own stage changes the url too
    const isNewLocalStageId = localStageId && localStageId !== oldLocalStageId
    const isUpdatedPhase = localStages !== oldLocalStages
    const isNewCheckStageId = getCheckStageId(meeting) !== getCheckStageId(oldMeeting)
    if (isNewLocalStageId || isUpdatedPhase || isNewCheckStageId) {
      if (isUpdatedPhase && !findStageById(phases, localStageId)) {
        updateLocalStage(atmosphere, meeting, facilitatorStageId)
      }
      const nextPathname = fromStageIdToUrl(
        localStageId,
        meeting,
        getTeamHealthCheckShownInRetro(meeting)
      )
      // the router holds a meeting on screen while it loads the next page, whose URL the meeting must
      // leave alone. The router has that page before the address bar does: when a meeting ends, a
      // replace queued behind the push to its summary would otherwise take the push's place
      const isMeetingUrl =
        getMeetingPathParams(router.history.location.pathname).meetingId === meeting.id
      if (nextPathname !== location.pathname && isMeetingUrl) {
        navigate({href: nextPathname, replace: true})
        // do not set as unsafe (repro: start meeting, end, start again)
        return
      }
    }
    setSafeRoute(true)
  })
}

export default useUpdatedSafeRoute
