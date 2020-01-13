import {DiscussPhaseReflectionGrid_reflections} from '../__generated__/DiscussPhaseReflectionGrid_reflections.graphql'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {meetingGridMinWidth} from '../styles/meeting'
import MasonryCSSGrid from './MasonryCSSGrid'
import ReflectionCard from './ReflectionCard/ReflectionCard'

interface Props {
  reflections: DiscussPhaseReflectionGrid_reflections
}

class DiscussPhaseReflectionGrid extends Component<Props> {
  render() {
    const {reflections} = this.props
    return (
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
    )
  }
}

export default createFragmentContainer(DiscussPhaseReflectionGrid, {
  reflections: graphql`
    fragment DiscussPhaseReflectionGrid_reflections on RetroReflection @relay(plural: true) {
      id
      ...ReflectionCard_reflection
    }
  `
})
