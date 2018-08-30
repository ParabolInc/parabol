import {PhaseItemColumn_meeting} from '__generated__/PhaseItemColumn_meeting.graphql'
import React, {Component} from 'react'
import styled from 'react-emotion'
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard'
import ExpandedReflectionStack from 'universal/components/RetroReflectPhase/ExpandedReflectionStack'
import getBBox from 'universal/components/RetroReflectPhase/getBBox'
import getTransform from 'universal/components/RetroReflectPhase/getTransform'
import ReflectionStackPlaceholder from 'universal/components/RetroReflectPhase/ReflectionStackPlaceholder'
import requestDoubleAnimationFrame from 'universal/components/RetroReflectPhase/requestDoubleAnimationFrame'
import {STANDARD_CURVE} from 'universal/styles/animation'
import ui from 'universal/styles/ui'

interface Props {
  idx: number
  meetingId: string,
  phaseItemId: string,
  phaseEditorRef: React.RefObject<HTMLDivElement>
  phaseRef: React.RefObject<HTMLDivElement>
  reflectionStack: ReadonlyArray<PhaseItemColumn_meeting['reflectionGroups'][0]['reflections'][0]>
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

  componentDidUpdate(prevProps) {
    const oldTop = prevProps.reflectionStack[prevProps.reflectionStack.length - 1]
    const newTop = this.props.reflectionStack[this.props.reflectionStack.length - 1]
    if (!oldTop || !newTop || oldTop.id !== newTop.id) {
      this.animateFromEditor(this.firstReflectionRef.current, this.props.phaseEditorRef.current)
    }
  }

  animateFromEditor(topCardDiv: HTMLDivElement, editorDiv: HTMLDivElement) {
    const first = getBBox(editorDiv)
    const last = getBBox(topCardDiv)
    topCardDiv.style.transform = getTransform(first, last)
    requestDoubleAnimationFrame(() => {
      topCardDiv.style.transition = `transform 300ms ${STANDARD_CURVE}`
      topCardDiv.style.transform = null
    })
  }

  expand = () => {
    if (this.props.reflectionStack.length <= 1) return
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
            {maxStack.length === 1 &&
            <ReflectionCard meetingId={meetingId} reflection={maxStack[0]} phaseItemId={phaseItemId}/>
            }
            {maxStack.length > 1 && maxStack.map((reflection, idx) => {
              return (
                <ReflectionWrapper key={reflection.id} idx={idx} count={maxStack.length}
                                   innerRef={idx === maxStack.length - 1 ? this.firstReflectionRef : undefined}>
                  <ReflectionCard meetingId={meetingId} reflection={reflection} phaseItemId={phaseItemId} readOnly
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
