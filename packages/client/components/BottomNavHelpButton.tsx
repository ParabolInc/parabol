import {keyframes} from '@emotion/core'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import {BottomNavHelpButton_meeting$key} from '~/__generated__/BottomNavHelpButton_meeting.graphql'
import BottomNavIconLabel, {paletteColors} from './BottomNavIconLabel'

const DEFAULT_DELAY_MILLISECOND = 30000

interface Props {
  icon?: string | undefined
  iconColor?: keyof typeof paletteColors
  label: any | undefined
  meetingRef: BottomNavHelpButton_meeting$key
}

const shake = keyframes`
  from, to {
    //padding: 12px;
    background: #a06bd6;
    color: white;
    border-radius: 4px;
    box-shadow: 0px 9px 12px rgba(68, 66, 88, 0.14), 0px 3px 16px rgba(68, 66, 88, 0.12), 0px 5px 6px rgba(68, 66, 88, 0.2);
  }
  0% {
    transform: rotate(4deg);
  }
  25% {
    transform: rotate(-7deg);
  }
  50% {
    transform: rotate(4deg);
  }
  75% {
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
      animation: `1s ease-in-out ${delay}ms 3 ${shake}`
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
  const {localPhase, reflectionGroups} = meeting
  // different condition for each phase
  const [delay, setDelay] = useState(2000)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  useEffect(() => {
    // only enable for facilitatorUser
    // if the ready button is "full" before these conditions are met, the animation should start after 5s
    if (localPhase.phaseType === 'reflect') {
      const reflectPrompts = localPhase!.reflectPrompts
      const hasNoEditing = !!reflectPrompts?.every(
        (prompts) => !prompts.editorIds || prompts.editorIds.length === 0
      )
      const isNotFocus = true

      console.log({meeting}, hasNoEditing)
      setShouldAnimate(isNotFocus && hasNoEditing)
    } else {
      if (localPhase.phaseType === 'group') {
        const isNotDragging = reflectionGroups?.every((group) =>
          group.reflections.every((reflection) => !reflection.isViewerDragging)
        )

        console.log({meeting}, isNotDragging)
        setDelay(DEFAULT_DELAY_MILLISECOND)
        setShouldAnimate(!!isNotDragging)
      } else if (localPhase.phaseType === 'vote') {
        const teamVotesRemaining = meeting.votesRemaining || 0
        const myVotesRemaining = meeting.viewerMeetingMember?.votesRemaining || 0
        const isNotVoting = teamVotesRemaining === 0 || myVotesRemaining === 0

        console.log({meeting}, isNotVoting)
        setDelay(DEFAULT_DELAY_MILLISECOND)
        setShouldAnimate(isNotVoting)
      } else if (localPhase.phaseType === 'discuss') {
        setDelay(5 * 60 * 1000)
        setShouldAnimate(true)
      }
    }
  }, [localPhase, reflectionGroups])

  return (
    <BottomNavButton
      label={label}
      delay={delay}
      shouldAnimate={shouldAnimate}
      icon={icon}
      iconColor={!shouldAnimate ? iconColor : undefined}
    />
  )
}

export default BottomNavHelpButton
