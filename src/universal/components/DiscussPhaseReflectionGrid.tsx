import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {meetingGridMinWidth} from 'universal/styles/meeting'
import ReflectionCard from './ReflectionCard/ReflectionCard'
import getBBox from './RetroReflectPhase/getBBox'
import {DiscussPhaseReflectionGrid_reflections} from '__generated__/DiscussPhaseReflectionGrid_reflections.graphql'

const ROW_GAP = 16
const MIN_HEIGHT = 4
const ReflectionGrid = styled('div')({
  display: 'grid',
  gridGap: ROW_GAP,
  gridAutoRows: MIN_HEIGHT,
  gridTemplateColumns: `repeat(auto-fill, minmax(${meetingGridMinWidth}, 1fr))`
})

const getSpan = (item) => {
  const bbox = getBBox(item)
  if (!bbox) return ''
  const rowSpan = Math.ceil((bbox.height + ROW_GAP) / (MIN_HEIGHT + ROW_GAP))
  return `span ${rowSpan}`
}

interface Props {
  reflections: DiscussPhaseReflectionGrid_reflections
}

class DiscussPhaseReflectionGrid extends Component<Props> {
  itemRefs = {}

  componentDidMount () {
    const {reflections} = this.props
    reflections.forEach(({id}) => {
      const itemRef = this.itemRefs[id]
      const span = getSpan(itemRef)
      itemRef.parentElement.style.gridRowEnd = span
    })
  }

  setItemRef = (id) => (c) => {
    this.itemRefs[id] = c
  }

  render () {
    const {reflections} = this.props
    return (
      <ReflectionGrid>
        {reflections.map((reflection) => {
          return (
            <div key={reflection.id}>
              <ReflectionCard
                innerRef={this.setItemRef(reflection.id)}
                reflection={reflection}
                readOnly
                userSelect='text'
              />
            </div>
          )
        })}
      </ReflectionGrid>
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
