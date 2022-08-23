import {keyframes} from '@emotion/core'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactNode, useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import {BottomControlBarReadyButton_meeting$key} from '~/__generated__/BottomControlBarReadyButton_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import isDemoRoute from '../utils/isDemoRoute'

const shakeAnimation = keyframes`
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

const BottomNavReadyButton = styled('div')<{showShakeAnimation?: boolean; delay?: number}>(
  ({showShakeAnimation, delay}) => {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: showShakeAnimation ? `1s ease-in-out ${delay}s 3 ${shakeAnimation}` : undefined
    }
  }
)

interface Props {
  meetingRef: BottomControlBarReadyButton_meeting$key
  progress: number
  children: ReactNode
}

const BottomControlBarReadyButton = (props: Props): JSX.Element => {
  const {meetingRef, progress, children} = props
  const meeting = useFragment(
    graphql`
      fragment BottomControlBarReadyButton_meeting on NewMeeting {
        localPhase {
          phaseType
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
          votesRemaining
        }
      }
    `,
    meetingRef
  )
  const {endedAt, facilitatorUserId, localPhase, reflectionGroups, votesRemaining} = meeting
  const [delaySeconds, setDelaySeconds] = useState<number>()
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  useEffect(() => {
    if (localPhase.phaseType !== 'reflect') return

    const hasNoReflection = reflectionGroups?.every((group) => group.reflections?.length === 0)
    if (hasNoReflection) return

    const reflectPrompts = localPhase.reflectPrompts!
    const beforeDemoStart =
      isDemoRoute() && reflectPrompts.every(({editorIds}) => !Array.isArray(editorIds))
    if (beforeDemoStart) return

    const isNotEditing = reflectPrompts.every(({editorIds}) => {
      return editorIds === undefined || (Array.isArray(editorIds) && editorIds.length === 0)
    })

    setDelaySeconds(isNotEditing ? 30 : undefined)
  }, [localPhase.phaseType === 'reflect', reflectionGroups, localPhase.reflectPrompts])

  useEffect(() => {
    if (localPhase.phaseType !== 'group') return
    if (reflectionGroups?.every((group) => group.reflections.length === 1)) return

    const isNotDragging = reflectionGroups?.every((group) =>
      group.reflections?.every(
        ({isDropping, isEditing, isViewerDragging}) =>
          !isViewerDragging && !isDropping && !isEditing
      )
    )

    setDelaySeconds(isNotDragging ? 30 : undefined)
  }, [localPhase.phaseType === 'group', reflectionGroups])

  useEffect(() => {
    if (localPhase.phaseType !== 'vote') return

    const teamVotesRemaining = votesRemaining ?? 0
    const noVotesRemaining = teamVotesRemaining === 0

    setDelaySeconds(noVotesRemaining ? 30 : undefined)
  }, [localPhase.phaseType === 'vote', votesRemaining])

  useEffect(() => {
    if (localPhase.phaseType !== 'discuss') return

    setDelaySeconds(5 * 60)
  }, [localPhase.phaseType === 'discuss'])

  useEffect(() => {
    // if the ready button is "full" before these conditions are met,
    // the animation should start after 5s
    if (progress !== 1) return

    setDelaySeconds(5)
  }, [progress === 1])

  // only enable for facilitatorUser
  const isFacilitator = viewerId === facilitatorUserId && !endedAt
  if (!isFacilitator) {
    return <>{children}</>
  }

  return (
    <BottomNavReadyButton showShakeAnimation={delaySeconds !== undefined} delay={delaySeconds}>
      {children}
    </BottomNavReadyButton>
  )
}

export default BottomControlBarReadyButton
