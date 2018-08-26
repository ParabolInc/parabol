import {ReflectionCard_reflection} from '__generated__/ReflectionCard_reflection.graphql'
import React, {Component} from 'react'
import styled from 'react-emotion'
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard'
import ReflectionStackPlaceholder from 'universal/components/RetroReflectPhase/ReflectionStackPlaceholder'
import ui from 'universal/styles/ui'

interface Props {
  idx: number
  meetingId: string,
  phaseItemId: string,
  reflectionStack: ReadonlyArray<ReflectionCard_reflection>
}

const CardStack = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  maxHeight: '9rem',
  minHeight: '9rem'
})

const CenteredCardStack = styled('div')({
  position: 'relative'
})

const ReflectionWrapper = styled('div')(({count, idx}: {count: number, idx: number}) => {
  switch (count - idx) {
    case 1:
      return {
        position: 'relative',
        zIndex: 2
      }
    case 2:
      return {
        backgroundColor: 'white',
        borderRadius: 4,
        boxShadow: ui.shadow[0],
        overflow: 'hidden',
        position: 'absolute',
        pointerEvents: 'none',
        top: 6,
        bottom: -2,
        transform: 'scale(0.97)',
        width: ui.retroCardWidth,
        zIndex: 1,
        // this feels cleaner than passing a prop, but I don't love it
        '& > div > div': {
          color: 'white'
        }
      }
    case 3:
      return {
        backgroundColor: 'white',
        borderRadius: 4,
        boxShadow: ui.shadow[0],
        overflow: 'hidden',
        position: 'absolute',
        pointerEvents: 'none',
        top: 6,
        bottom: -8,
        transform: 'scale(0.94)',
        width: ui.retroCardWidth,
        zIndex: 1,
        '& > div > div': {
          color: 'white'
        }
      }
    default:
      return {}
  }
})

class ReflectionStack extends Component<Props> {
  render() {
    const {idx, reflectionStack, phaseItemId, meetingId} = this.props
    if (reflectionStack.length === 0) {
      return <ReflectionStackPlaceholder idx={idx} />
    }
    const maxStack = reflectionStack.slice(Math.max(0, reflectionStack.length - 3))
    return (
      <CardStack>
        <CenteredCardStack>
        {maxStack.map((reflection, idx) => {
          return (
            <ReflectionWrapper key={(reflection as any).id} idx={idx} count={maxStack.length}>
              <ReflectionCard meetingId={meetingId} reflection={reflection} phaseItemId={phaseItemId} readOnly
                              userSelect='none' />
            </ReflectionWrapper>
          )
        })}
        </CenteredCardStack>
      </CardStack>
    )
  }
}

export default ReflectionStack
