import {DiscussPhaseReflectionGrid_reflections} from '__generated__/DiscussPhaseReflectionGrid_reflections.graphql'
import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {meetingGridMinWidth} from 'universal/styles/meeting'
import MasonryCSSGrid from './MasonryCSSGrid'
import ReflectionCard from './ReflectionCard/ReflectionCard'

interface Props {
  reflections: DiscussPhaseReflectionGrid_reflections
}

class DiscussPhaseReflectionGrid extends Component<Props> {
  render () {
    const {reflections} = this.props
    return (
      <MasonryCSSGrid colWidth={meetingGridMinWidth} gap={12}>
        {(setItemRef) => {
          return reflections.map((reflection) => {
            return (
              <div key={reflection.id} ref={setItemRef(reflection.id)}>
                <ReflectionCard reflection={reflection} readOnly userSelect='text' />
              </div>
            )
          })
        }}
      </MasonryCSSGrid>
    )
  }
}

export default createFragmentContainer(
  DiscussPhaseReflectionGrid,
  graphql`
    fragment DiscussPhaseReflectionGrid_reflections on RetroReflection @relay(plural: true) {
      id
      ...ReflectionCard_reflection
    }
  `
)
