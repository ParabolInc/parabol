import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {useFragment} from 'react-relay'
import type {DiscussPhaseReflectionGrid_meeting$key} from '~/__generated__/DiscussPhaseReflectionGrid_meeting.graphql'
import {useCoverable} from '~/hooks/useControlBarCovers'
import {MeetingControlBarEnum} from '~/types/constEnums'
import {ElementWidth} from '../types/constEnums'
import {cn} from '../ui/cn'
import MasonryCSSGrid from './MasonryCSSGrid'
import ReflectionCard from './ReflectionCard/ReflectionCard'

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
    <div
      ref={ref}
      className={cn(
        'mb-4 overflow-auto px-4 pt-2 pb-0',
        isExpanded ? 'h-full' : 'h-[calc(100%-72px)]'
      )}
    >
      <MasonryCSSGrid colWidth={ElementWidth.REFLECTION_CARD} gap={12}>
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
    </div>
  )
}

export default DiscussPhaseReflectionGrid
