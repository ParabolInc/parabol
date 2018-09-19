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
import {reflectionCardMaxHeight, reflectionCardWidth} from 'universal/styles/cards'
import {cardShadow} from 'universal/styles/elevation'
import getDeCasteljau from 'universal/utils/getDeCasteljau'

interface Props {
  idx: number
  meetingId: string
  phaseItemId: string
  phaseEditorRef: React.RefObject<HTMLDivElement>
  phaseRef: React.RefObject<HTMLDivElement>
  reflectionStack: ReadonlyArray<PhaseItemColumn_meeting['reflectionGroups'][0]['reflections'][0]>
}

interface State {
  isExpanded: boolean
}

const CardStack = styled('div')(({isVisible}: {isVisible: boolean}) => ({
  alignItems: 'flex-start',
  display: 'flex',
  justifyContent: 'center',
  margin: '2rem 0',
  minHeight: reflectionCardMaxHeight,
  visibility: !isVisible ? 'hidden' : undefined
}))

const CenteredCardStack = styled('div')({
  position: 'relative'
})

const HIDE_LINES_HACK_STYLES = {
  background: 'white',
  content: '""',
  height: 12,
  left: 0,
  position: 'absolute',
  right: 0,
  zIndex: 200
}

const CARD_IN_STACK = {
  backgroundColor: 'white',
  borderRadius: 4,
  boxShadow: cardShadow,
  cursor: 'pointer',
  overflow: 'hidden',
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 1,
  // hides partially overflown top lines of text
  '&::before': {
    ...HIDE_LINES_HACK_STYLES,
    top: 0
  },
  // hides partially overflown bottom lines of text
  '&::after': {
    ...HIDE_LINES_HACK_STYLES,
    bottom: 0
  },
  '& > div': {
    bottom: 0,
    boxShadow: 'none',
    // override inline-block from ReflectionCard.tsx
    // for stack to line up right b/c inline-block breathes vertically
    display: 'block',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 100
  }
}

const STACK_PERSPECTIVE_X = 8
const STACK_PERSPECTIVE_Y = 6

const ReflectionWrapper = styled('div')(({count, idx}: {count: number; idx: number}) => {
  switch (count - idx) {
    case 1:
      return {
        cursor: 'pointer',
        position: 'relative',
        zIndex: 2,
        '& > div': {
          // override inline-block from ReflectionCard.tsx
          // for stack to line up right b/c inline-block breathes vertically
          display: 'block'
        }
      }
    case 2:
      return {
        ...CARD_IN_STACK,
        bottom: -STACK_PERSPECTIVE_Y,
        left: STACK_PERSPECTIVE_X,
        right: STACK_PERSPECTIVE_X,
        top: STACK_PERSPECTIVE_Y,
        '& > div > div': {
          transform: 'scale(.95)',
          transformOrigin: 'left',
          width: reflectionCardWidth
        }
      }
    case 3:
      return {
        ...CARD_IN_STACK,
        bottom: -(STACK_PERSPECTIVE_Y * 2),
        left: STACK_PERSPECTIVE_X * 2,
        right: STACK_PERSPECTIVE_X * 2,
        top: STACK_PERSPECTIVE_Y * 2
      }
    default:
      return {}
  }
})

const ANIMATION_DURATION = 300
const EASING = STANDARD_CURVE

class ReflectionStack extends Component<Props, State> {
  state = {
    isExpanded: false
  }

  animationStart: number = 0
  stackRef = React.createRef<HTMLDivElement>()
  firstReflectionRef = React.createRef<HTMLDivElement>()

  getSnapshotBeforeUpdate (prevProps: Props) {
    const oldTop = prevProps.reflectionStack[prevProps.reflectionStack.length - 1]
    const newTop = this.props.reflectionStack[this.props.reflectionStack.length - 1]
    if (
      !this.firstReflectionRef.current ||
      !this.props.phaseEditorRef.current ||
      (oldTop && oldTop.id) === (newTop && newTop.id)
    ) {
      return null
    }
    const duration = ANIMATION_DURATION - (Date.now() - this.animationStart)
    if (duration <= 0) return {duration: ANIMATION_DURATION, easing: EASING}
    // an animation is already in progress!
    return {
      startCoords: this.firstReflectionRef.current.getBoundingClientRect(),
      duration,
      easing: getDeCasteljau(1 - duration / ANIMATION_DURATION, EASING)
    }
  }

  componentDidUpdate (_prevProps, _prevState, snapshot) {
    if (this.firstReflectionRef.current && snapshot) {
      const first = snapshot.startCoords || getBBox(this.props.phaseEditorRef.current)
      this.animateFromEditor(
        this.firstReflectionRef.current,
        first,
        snapshot.duration,
        snapshot.easing
      )
    }
  }

  animateFromEditor (firstReflectionDiv: HTMLDivElement, first, duration, easing) {
    const last = getBBox(firstReflectionDiv)
    if (!first || !last) return
    firstReflectionDiv.style.transform = getTransform(first, last)
    requestDoubleAnimationFrame(() => {
      this.animationStart = Date.now()
      firstReflectionDiv.style.transition = `transform ${duration}ms ${easing}`
      firstReflectionDiv.style.transform = null
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

  render () {
    const {idx, reflectionStack, phaseItemId, phaseRef, meetingId} = this.props
    const {isExpanded} = this.state
    if (reflectionStack.length === 0) {
      return <ReflectionStackPlaceholder idx={idx} />
    }
    const maxStack = reflectionStack.slice(Math.max(0, reflectionStack.length - 3))
    return (
      <React.Fragment>
        <ExpandedReflectionStack
          collapse={this.collapse}
          isExpanded={isExpanded}
          phaseRef={phaseRef}
          stackRef={this.stackRef}
          reflectionStack={reflectionStack}
          meetingId={meetingId}
          phaseItemId={phaseItemId}
          firstReflectionRef={this.firstReflectionRef}
        />
        <CardStack onClick={this.expand} isVisible={!isExpanded} innerRef={this.stackRef}>
          <CenteredCardStack>
            {maxStack.length === 1 && (
              <div ref={this.firstReflectionRef}>
                <ReflectionCard
                  meetingId={meetingId}
                  reflection={maxStack[0]}
                  phaseItemId={phaseItemId}
                />
              </div>
            )}
            {maxStack.length > 1 &&
              maxStack.map((reflection, idx) => {
                return (
                  <ReflectionWrapper
                    key={reflection.id}
                    idx={idx}
                    count={maxStack.length}
                    innerRef={idx === maxStack.length - 1 ? this.firstReflectionRef : undefined}
                  >
                    <ReflectionCard
                      meetingId={meetingId}
                      reflection={reflection}
                      phaseItemId={phaseItemId}
                      readOnly
                      userSelect='none'
                    />
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
