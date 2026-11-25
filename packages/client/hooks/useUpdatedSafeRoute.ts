import {useNavigate} from '@tanstack/react-router'
import graphql from 'babel-plugin-relay/macro'
import {type Dispatch, type SetStateAction, useEffect, useRef} from 'react'
import {readInlineData} from 'relay-runtime'
import type {useUpdatedSafeRoute_meeting$key} from '~/__generated__/useUpdatedSafeRoute_meeting.graphql'
import findStageById from '../utils/meetings/findStageById'
import fromStageIdToUrl from '../utils/meetings/fromStageIdToUrl'
import getTeamHealthCheckShownInRetro from '../utils/meetings/getTeamHealthCheckShownInRetro'
import updateLocalStage from '../utils/relay/updateLocalStage'
import useAtmosphere from './useAtmosphere'

const useUpdatedSafeRoute = (
  setSafeRoute: Dispatch<SetStateAction<boolean>>,
  meetingRef: useUpdatedSafeRoute_meeting$key
) => {
  const navigate = useNavigate()
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
    // the check as is, not as shown: the retro ending mustn't move the url while everyone heads to
    // its summary
    const getCheckStageId = (shownMeeting: typeof meeting) =>
      shownMeeting.localPhase?.phaseType === 'TEAM_HEALTH'
        ? shownMeeting.teamHealthMeeting?.localStage?.id
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
      if (nextPathname !== location.pathname) {
        navigate({href: nextPathname, replace: true})
        // do not set as unsafe (repro: start meeting, end, start again)
        return
      }
    }
    setSafeRoute(true)
  })
}

export default useUpdatedSafeRoute
