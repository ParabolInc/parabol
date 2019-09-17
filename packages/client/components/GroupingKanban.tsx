import React, {RefObject, useMemo, useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {GroupingKanban_meeting} from '__generated__/GroupingKanban_meeting.graphql'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import styled from '@emotion/styled'
import GroupingKanbanColumn from './GroupingKanbanColumn'
import PortalProvider from './AtmosphereProvider/PortalProvider'
import useHideBodyScroll from '../hooks/useHideBodyScroll'
import ReflectWrapperDesktop from './RetroReflectPhase/ReflectWrapperDesktop'
import ReflectWrapperMobile from './RetroReflectPhase/ReflectionWrapperMobile'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint} from '../types/constEnums'

interface Props {
  meeting: GroupingKanban_meeting,
  phaseRef: RefObject<HTMLDivElement>
  resetActivityTimeout: () => void
}

const ColumnsBlock = styled('div')({
  display: 'flex',
  flex: '1',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  margin: '0 auto',
  maxHeight: 608,
  overflow: 'auto',
  width: '100%'
})

const GroupingKanban = (props: Props) => {
  const {meeting, phaseRef} = props
  const {reflectionGroups, phases} = meeting
  const reflectPhase = phases.find((phase) => phase.phaseType === NewMeetingPhaseTypeEnum.reflect)!
  const reflectPrompts = reflectPhase.reflectPrompts!
  useHideBodyScroll()
  const groupsByPhaseItem = useMemo(() => {
    const container = {} as {[phaseItemId: string]: typeof reflectionGroups[0][]}
    for (let i = 0; i < reflectionGroups.length; i++) {
      const group = reflectionGroups[i]
      const {retroPhaseItemId} = group
      container[retroPhaseItemId] = container[retroPhaseItemId] || []
      container[retroPhaseItemId].push(group)
    }
    return container
  }, [reflectionGroups])
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const [activeIdx, setActiveIdx] = useState(0)
  const ColumnWrapper = isDesktop ? ReflectWrapperDesktop : ReflectWrapperMobile
  return (
    <PortalProvider>
      <ColumnsBlock>
        <ColumnWrapper setActiveIdx={setActiveIdx} activeIdx={activeIdx}>
          {reflectPrompts.map((prompt) => (
            <GroupingKanbanColumn
              key={prompt.id}
              meeting={meeting}
              phaseRef={phaseRef}
              prompt={prompt}
              reflectionGroups={groupsByPhaseItem[prompt.id] || []}
            />
          ))}
        </ColumnWrapper>
      </ColumnsBlock>
    </PortalProvider>
  )
}

export default createFragmentContainer(
  GroupingKanban,
  {
    meeting: graphql`
      fragment GroupingKanban_meeting on RetrospectiveMeeting {
        ...GroupingKanbanColumn_meeting
        phases {
          ...on ReflectPhase {
            phaseType
            reflectPrompts {
              ...GroupingKanbanColumn_prompt
              id
            }
          }
        }
        reflectionGroups {
          ...GroupingKanbanColumn_reflectionGroups
          id
          retroPhaseItemId
        }
      }`
  }
)
