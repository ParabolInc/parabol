import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {useFragment} from 'react-relay'
import {useCoverable} from '~/hooks/useControlBarCovers'
import {MeetingControlBarEnum} from '~/types/constEnums'
import {DiscussPhaseReflectionGrid_meeting$key} from '~/__generated__/DiscussPhaseReflectionGrid_meeting.graphql'
import {meetingGridMinWidth} from '../styles/meeting'
import MasonryCSSGrid from './MasonryCSSGrid'
import ReflectionCard from './ReflectionCard/ReflectionCard'

const GridWrapper = styled('div')<{isExpanded: boolean}>(({isExpanded}) => ({
  height: isExpanded ? '100%' : `calc(100% - ${MeetingControlBarEnum.HEIGHT + 16}px)`,
  overflow: 'auto',
  padding: '8px 16px 0',
  marginBottom: 16
}))

interface Props {
  meeting: DiscussPhaseReflectionGrid_meeting$key
}

const DiscussPhaseReflectionGrid = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment DiscussPhaseReflectionGrid_meeting on RetrospectiveMeeting {
        ...ReflectionCard_meeting
        localStage {
          ... on RetroDiscussStage {
            reflectionGroup {
              reflections {
                ...ReflectionCard_reflection
                id
              }
            }
          }
        }
        phases {
          stages {
            ... on RetroDiscussStage {
              reflectionGroup {
                reflections {
                  ...ReflectionCard_reflection
                  id
                }
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {localStage} = meeting
  const {reflectionGroup} = localStage
  const {reflections} = reflectionGroup!
  const ref = useRef<HTMLDivElement>(null)
  const isExpanded = useCoverable('reflections', ref, MeetingControlBarEnum.HEIGHT + 16)
  if (!reflections) return null
  return (
    <GridWrapper ref={ref} isExpanded={isExpanded}>
      <MasonryCSSGrid colWidth={meetingGridMinWidth} gap={12}>
        {(setItemRef) => {
          return reflections.map((reflection) => {
            return (
              <div key={reflection.id} ref={setItemRef(reflection.id)}>
                <ReflectionCard showReactji reflectionRef={reflection} meetingRef={meeting} />
              </div>
            )
          })
        }}
      </MasonryCSSGrid>
    </GridWrapper>
  )
}

export default DiscussPhaseReflectionGrid
