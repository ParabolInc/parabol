import {ReflectionCard_reflection} from '__generated__/ReflectionCard_reflection.graphql'
import React, {Component} from 'react'
import styled from 'react-emotion'
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard'
import ExpandedReflectionStack from 'universal/components/RetroReflectPhase/ExpandedReflectionStack'
import ReflectionStackPlaceholder from 'universal/components/RetroReflectPhase/ReflectionStackPlaceholder'
import ui from 'universal/styles/ui'

interface Props {
  idx: number
  meetingId: string,
  phaseItemId: string,
  phaseRef: React.RefObject<HTMLDivElement>
  reflectionStack: ReadonlyArray<ReflectionCard_reflection>
}

interface State {
  isExpanded: boolean
}

const CardStack = styled('div')(({isVisible}: {isVisible: boolean}) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  maxHeight: '9rem',
  minHeight: '9rem',
  visibility: !isVisible ? 'hidden' : undefined
}))

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

class ReflectionStack extends Component<Props, State> {
  state = {
    isExpanded: false
  }
  stackRef = React.createRef<HTMLDivElement>()
  firstReflectionRef = React.createRef<HTMLDivElement>()

  expand = () => {
    this.setState({isExpanded: true})
  }

  collapse = () => {
    this.setState({
      isExpanded: false
    })
  }

  render() {
    const {idx, reflectionStack, phaseItemId, phaseRef, meetingId} = this.props
    const {isExpanded} = this.state
    if (reflectionStack.length === 0) {
      return <ReflectionStackPlaceholder idx={idx} />
    }
    const maxStack = reflectionStack.slice(Math.max(0, reflectionStack.length - 3))
    return (
      <React.Fragment>
        <ExpandedReflectionStack collapse={this.collapse} isExpanded={isExpanded} phaseRef={phaseRef}
                                 stackRef={this.stackRef} reflectionStack={reflectionStack} meetingId={meetingId}
                                 phaseItemId={phaseItemId} firstReflectionRef={this.firstReflectionRef} />
        <CardStack onClick={this.expand} isVisible={!isExpanded} innerRef={this.stackRef}>
          <CenteredCardStack>
            {maxStack.map((reflection, idx) => {
              return (
                <ReflectionWrapper key={(reflection as any).id} idx={idx} count={maxStack.length}
                                   innerRef={idx === maxStack.length - 1 ? this.firstReflectionRef : undefined}>
                  <ReflectionCard meetingId={meetingId} reflection={(reflection as any)} phaseItemId={phaseItemId} readOnly
                                  userSelect='none' />
                </ReflectionWrapper>
              )
            })}
          </CenteredCardStack>
        </CardStack>
      </React.Fragment>
    )
  }
}

export default ReflectionStack
