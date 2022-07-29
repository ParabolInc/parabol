import {keyframes} from '@emotion/core'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import {BottomNavHelpButton_meeting$key} from '~/__generated__/BottomNavHelpButton_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import BottomNavIconLabel, {paletteColors} from './BottomNavIconLabel'

interface Props {
  icon?: string | undefined
  iconColor?: keyof typeof paletteColors
  label: any | undefined
  meetingRef: BottomNavHelpButton_meeting$key
}

const shake = keyframes`
  20%, 40%, 60% {
    padding: 12px;
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

const BottomNavButton = styled(BottomNavIconLabel)<{shouldAnimate?: boolean; delay: number}>(
  ({shouldAnimate, delay}) => {
    if (!shouldAnimate) return

    return {
      animation: `1s ease-in-out ${delay}s 3 ${shake}`
    }
  }
)

const BottomNavHelpButton = (props: Props) => {
  const {icon, iconColor, label, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment BottomNavHelpButton_meeting on NewMeeting {
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
        const reflectPrompts = localPhase.reflectPrompts!
        const beforeDemoStart = reflectPrompts.every((prompts) => !Array.isArray(prompts.editorIds))
        const hasAnyoneEditing = reflectPrompts.some((prompts) => prompts.editorIds?.length !== 0)

        setShouldAnimate(!beforeDemoStart && !hasAnyoneEditing)
        break
      case 'group':
        const isNotDragging = reflectionGroups?.every((group) =>
          group.reflections.every((reflection) => !reflection.isViewerDragging)
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
    <BottomNavButton
      label={label}
      delay={delaySeconds}
      shouldAnimate={shouldAnimate}
      icon={icon}
      iconColor={!shouldAnimate ? iconColor : undefined}
    />
  )
}

export default BottomNavHelpButton
