import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard'
import ReflectionStackPlaceholder from 'universal/components/RetroReflectPhase/ReflectionStackPlaceholder'
import ui from 'universal/styles/ui'

interface Props {
  idx: number
  meeting: any,
  reflectionStack: Array<any>
}

const CardStack = styled('div')({})


const ReflectionWrapper = styled('div')(({idx}: {idx: number}) => {
  if (idx === 0) {
    return {
      position: idx === 0 ? 'absolute' : 'relative'
    }
  } else if (idx === 1) {
    return {
      backgroundColor: 'white',
      borderRadius: 4,
      boxShadow: ui.shadow[0],
      overflow: 'hidden',
      position: 'absolute',
      pointerEvents: 'none',
      left: 6,
      top: 6,
      right: -6,
      bottom: -2,
      width: ui.retroCardWidth
    }
  }
  return {}
})

class ReflectionStack extends Component<Props> {
  render() {
    const {idx, reflectionStack, meeting} = this.props
    if (reflectionStack.length === 0) {
      return <ReflectionStackPlaceholder idx={idx} />
    }
    const maxStack = reflectionStack.slice(Math.max(0, reflectionStack.length - 3)).reverse()
    return (
      <CardStack>
        {maxStack.map((reflection, idx) => {
          return (
            <ReflectionWrapper key={reflection.reflectionId} idx={idx}>
              <ReflectionCard meeting={meeting} reflection={reflection} />
            </ReflectionWrapper>
          )
        })}
      </CardStack>
    )
  }
}

export default createFragmentContainer(
  ReflectionStack,
  graphql`
    fragment ReflectionStack_meeting on RetrospectiveMeeting {
      ...ReflectionCard_meeting
    }
  `
)
