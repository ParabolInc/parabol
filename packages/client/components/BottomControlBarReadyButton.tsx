import {keyframes} from '@emotion/core'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactNode, useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import {BottomControlBarReadyButton_meeting$key} from '~/__generated__/BottomControlBarReadyButton_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import isDemoRoute from '../utils/isDemoRoute'

const shake = keyframes`
  20%, 40%, 60% {
    padding: 4px 4px 8px;
    overflow: hidden;
    background: #a06bd6;
    color: white;
    border-radius: 4px;
    box-shadow: 0px 9px 12px rgba(68, 66, 88, 0.14), 0px 3px 16px rgba(68, 66, 88, 0.12), 0px 5px 6px rgba(68, 66, 88, 0.2);
  }
  0% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(-7deg);
  }
  40% {
    transform: rotate(4deg);
  }
  60% {
    transform: rotate(-7deg);
  }
  100% {
    transform: rotate(0deg);
  }
`

const BottomNavReadyButton = styled('div')<{shouldAnimate?: boolean; delay: number}>(
  ({shouldAnimate, delay}) => {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: shouldAnimate ? `1s ease-in-out ${delay}s 3 ${shake}` : undefined
    }
  }
)

interface BottomControlBarReadyButton {
  meetingRef: BottomControlBarReadyButton_meeting$key
  children: ReactNode
}

const BottomControlBarReadyButton = (props: BottomControlBarReadyButton) => {
  const {meetingRef, children} = props
  const meeting = useFragment(
    graphql`
      fragment BottomControlBarReadyButton_meeting on NewMeeting {
        localPhase {
          phaseType
        }
        localStage {
          readyCount
          isViewerReady
        }
        meetingMembers {
          id
        }
        ... on RetrospectiveMeeting {
          endedAt
          facilitatorUserId
          localPhase {
            ... on ReflectPhase {
              reflectPrompts {
                id
                editorIds
              }
            }
          }
          reflectionGroups {
            id
            reflections {
              id
              isEditing
              isDropping
              isViewerDragging
            }
          }
          viewerMeetingMember {
            votesRemaining
          }
          votesRemaining
        }
      }
    `,
    meetingRef
  )
  const {
    endedAt,
    facilitatorUserId,
    localPhase,
    localStage,
    meetingMembers,
    reflectionGroups,
    viewerMeetingMember,
    votesRemaining
  } = meeting
  const [delaySeconds, setDelaySeconds] = useState(2)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  useEffect(() => {
    // only enable for facilitatorUser
    const isFacilitator = viewerId === facilitatorUserId && !endedAt
    if (!isFacilitator) return

    switch (localPhase.phaseType) {
      case 'reflect':
        const hasNoReflection = reflectionGroups?.every((group) => group.reflections?.length === 0)
        if (hasNoReflection) return

        const reflectPrompts = localPhase.reflectPrompts!
        const beforeDemoStart =
          isDemoRoute() && reflectPrompts.every(({editorIds}) => !Array.isArray(editorIds))
        if (beforeDemoStart) return

        const isNotEditing = reflectPrompts.every(({editorIds}) => {
          return editorIds === undefined || (Array.isArray(editorIds) && editorIds.length === 0)
        })

        setShouldAnimate(isNotEditing)
        break
      case 'group':
        const isNotDragging = reflectionGroups?.every((group) =>
          group.reflections?.every(
            (reflection) => !reflection.isViewerDragging && !reflection.isDropping
          )
        )

        setDelaySeconds(30)
        setShouldAnimate(!!isNotDragging)
        break
      case 'vote':
        const teamVotesRemaining = votesRemaining || 0
        const myVotesRemaining = viewerMeetingMember?.votesRemaining || 0
        const isNotVoting = teamVotesRemaining === 0 || myVotesRemaining === 0

        setDelaySeconds(30)
        setShouldAnimate(isNotVoting)
        break
      case 'discuss':
        // this is a tricky one since a lot could be happening sync in a call. Maybe we hint after 5 minutes?
        setDelaySeconds(5 * 60)
        setShouldAnimate(true)
        break
    }

    // if the ready button is "full" before these conditions are met, the animation should start after 5s
    // TODO: replace with props from ButtonControlBarReady
    const activeCount = meetingMembers.length
    const readyCount = localStage.readyCount || 0
    if (readyCount === Math.max(1, activeCount - 1)) {
      setDelaySeconds(5)
      setShouldAnimate(true)
    }
  }, [
    localPhase.phaseType,
    localPhase.reflectPrompts,
    localStage.readyCount,
    reflectionGroups,
    meetingMembers,
    viewerMeetingMember,
    votesRemaining
  ])

  return (
    <BottomNavReadyButton shouldAnimate={shouldAnimate} delay={delaySeconds}>
      {children}
    </BottomNavReadyButton>
  )
}

export default BottomControlBarReadyButton
