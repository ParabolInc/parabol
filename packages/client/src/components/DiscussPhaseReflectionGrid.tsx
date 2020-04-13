import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useCoverable} from '~/hooks/useControlBarCovers'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {MeetingControlBarEnum} from '~/types/constEnums'
import {meetingGridMinWidth} from '../styles/meeting'
import {DiscussPhaseReflectionGrid_reflections} from '../__generated__/DiscussPhaseReflectionGrid_reflections.graphql'
import MasonryCSSGrid from './MasonryCSSGrid'
import ReflectionCard from './ReflectionCard/ReflectionCard'

const GridWrapper = styled('div')<{isExpanded: boolean}>(({isExpanded}) => ({
  height: isExpanded ? '100%' : `calc(100% - ${MeetingControlBarEnum.HEIGHT + 16}px)`,
  overflow: 'auto',
  marginBottom: 16
}))

interface Props {
  reflections: DiscussPhaseReflectionGrid_reflections
}

const DiscussPhaseReflectionGrid = (props: Props) => {
  const {reflections} = props
  const ref = useRef<HTMLDivElement>(null)
  const isExpanded = useCoverable('reflections', ref, MeetingControlBarEnum.HEIGHT + 16)
  return (
    <GridWrapper ref={ref} isExpanded={isExpanded}>
      <MasonryCSSGrid colWidth={meetingGridMinWidth} gap={12}>
        {(setItemRef) => {
          return reflections.map((reflection) => {
            return (
              <div key={reflection.id} ref={setItemRef(reflection.id)}>
                <ReflectionCard
                  showReactji
                  showOriginFooter
                  reflection={reflection}
                  meeting={null}
                />
              </div>
            )
          })
        }}
      </MasonryCSSGrid>
    </GridWrapper>
  )
}

export default createFragmentContainer(DiscussPhaseReflectionGrid, {
  reflections: graphql`
    fragment DiscussPhaseReflectionGrid_reflections on RetroReflection @relay(plural: true) {
      id
      ...ReflectionCard_reflection
    }
  `
})
