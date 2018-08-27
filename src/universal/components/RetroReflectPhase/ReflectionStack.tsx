import {ReflectionCard_reflection} from '__generated__/ReflectionCard_reflection.graphql'
import React, {Component} from 'react'
import styled from 'react-emotion'
import {Transition} from 'react-transition-group'
import Modal from 'universal/components/Modal'
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard'
import ReflectionStackPlaceholder from 'universal/components/RetroReflectPhase/ReflectionStackPlaceholder'
import {DECELERATE} from 'universal/styles/animation'
import {ZINDEX_MODAL} from 'universal/styles/elevation'
import ui from 'universal/styles/ui'

interface Props {
  idx: number
  meetingId: string,
  phaseItemId: string,
  phaseRef: React.RefObject<HTMLDivElement>
  reflectionStack: ReadonlyArray<ReflectionCard_reflection>
}

interface State {
  isClosing: boolean,
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

interface ExpandedCardStackProps {
  phaseDiv: HTMLDivElement,
  stackDiv: HTMLDivElement,
  state: string
}

const ExpandedCardStack = styled('div')(
  {
    borderRadius: 4,
    position: 'absolute',
    zIndex: ZINDEX_MODAL,
    transition: `300ms ${DECELERATE}`
  },
  ({phaseDiv, stackDiv, state}: ExpandedCardStackProps) => {
    if (state === 'entering' || state === 'exiting') {
      const bbox = stackDiv.getBoundingClientRect()
      const {height, width, top, left} = bbox
      return {
        backgroundColor: '',
        height,
        width,
        top,
        left
      }
    } else if (state === 'entered') {
      const bbox = phaseDiv.getBoundingClientRect()
      const width = 600
      const height = 300
      return {
        backgroundColor: 'rgba(68, 66, 88, .65)',
        height,
        width,
        left: (bbox.width - width) / 2 + bbox.left,
        top: (bbox.height - height) / 2 + bbox.top
      }
    }
    return {}
  }
)

class ReflectionStack extends Component<Props, State> {
  state = {
    isExpanded: false,
    isClosing: false
  }
  stackRef = React.createRef<HTMLDivElement>()
  expand = () => {
    this.setState({isExpanded: true})
  }

  collapse = () => {
    this.setState({
      isExpanded: false,
      isClosing: true
    })
    window.setTimeout(() => {
      this.setState({
        isClosing: false
      })
    }, 300)
  }

  render() {
    const {idx, reflectionStack, phaseItemId, phaseRef, meetingId} = this.props
    const {isClosing, isExpanded} = this.state
    if (reflectionStack.length === 0) {
      return <ReflectionStackPlaceholder idx={idx} />
    }
    const maxStack = reflectionStack.slice(Math.max(0, reflectionStack.length - 3))
    return (
      <React.Fragment>
        <Transition mountOnEnter in={isExpanded} timeout={300}>
          {(state) => (
            <Modal clickToClose escToClose isOpen={state !== 'exited'} onClose={this.collapse}>
              <ExpandedCardStack phaseDiv={phaseRef.current} stackDiv={this.stackRef.current} state={state} >
                {maxStack.map((reflection, idx) => {
                  return (
                    <ReflectionWrapper key={(reflection as any).id} idx={idx} count={maxStack.length}>
                      <ReflectionCard meetingId={meetingId} reflection={reflection} phaseItemId={phaseItemId} readOnly
                                      userSelect='none' />
                    </ReflectionWrapper>
                  )
                })}
              </ExpandedCardStack>
            </Modal>
          )
          }
        </Transition>
        <CardStack onClick={this.expand} isVisible={!isExpanded && !isClosing} innerRef={this.stackRef}>
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
      </React.Fragment>
    )
  }
}

export default ReflectionStack
