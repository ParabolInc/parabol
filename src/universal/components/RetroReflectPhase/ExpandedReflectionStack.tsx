import {PhaseItemColumn_meeting} from '__generated__/PhaseItemColumn_meeting.graphql'
import React, {Component} from 'react'
import styled from 'react-emotion'
import Modal from 'universal/components/Modal'
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard'
import FLIPGrid from 'universal/components/RetroReflectPhase/FLIPGrid'
import FLIPModal from 'universal/components/RetroReflectPhase/FLIPModal'
import getBBox from 'universal/components/RetroReflectPhase/getBBox'
import {cardShadow} from 'universal/styles/elevation'

interface Props {
  collapse(): void,

  isExpanded: boolean,
  phaseRef: React.RefObject<HTMLDivElement>,
  stackRef: React.RefObject<HTMLDivElement>,
  firstReflectionRef: React.RefObject<HTMLDivElement>,
  reflectionStack: ReadonlyArray<PhaseItemColumn_meeting['reflectionGroups'][0]['reflections'][0]>
  meetingId: string,
  phaseItemId: string
}

interface State {
  isClosing: boolean
}

const ModalReflectionWrapper = styled('div')({
  boxShadow: cardShadow,
  display: 'inline-flex',
  position: 'absolute'
})

class ExpandedReflectionStack extends Component<Props, State> {
  state = {
    isClosing: false
  }
  gridRef = React.createRef<FLIPGrid>()
  getModalFirst = () => getBBox(this.props.stackRef.current)
  getParentBBox = () => getBBox(this.props.phaseRef.current)
  getChildrenFirst = () => getBBox(this.props.firstReflectionRef.current)

  checkForResize = (key) => () => {
    this.gridRef.current.checkForResize(key)
  }

  handleClose = () => {
    this.setState({
      isClosing: true
    })
  }

  finishClose = () => {
    this.setState({
      isClosing: false
    })
    this.props.collapse()
  }

  render() {
    const {isExpanded, reflectionStack, meetingId, phaseItemId} = this.props
    const {isClosing} = this.state
    return (
      <Modal clickToClose escToClose isOpen={isExpanded} onClose={this.handleClose}>
        <FLIPModal getFirst={this.getModalFirst} getParentBBox={this.getParentBBox}
                   childrenLen={reflectionStack.length} isClosing={isClosing} close={this.finishClose}>
          {(setBBox) => (
            <FLIPGrid ref={this.gridRef} getFirst={this.getChildrenFirst} getParentBBox={this.getParentBBox} setBBox={setBBox}
                      isClosing={isClosing}>
              {reflectionStack.map((reflection, idx) => {
                return (
                  <ModalReflectionWrapper key={reflection.id} style={{zIndex: idx + 1}}>
                    <ReflectionCard meetingId={meetingId}
                                    reflection={reflection}
                                    phaseItemId={phaseItemId}
                                    handleChange={this.checkForResize(reflection.id)}
                    />
                  </ModalReflectionWrapper>

                )
              })}
            </FLIPGrid>
          )}
        </FLIPModal>
      </Modal>
    )
  }
}

export default ExpandedReflectionStack
