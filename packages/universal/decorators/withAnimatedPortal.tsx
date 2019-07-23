import React, {Component} from 'react'
import {Subtract} from 'types/generics'
import getDisplayName from 'universal/utils/getDisplayName'

/*
 * Takes the child component and puts it in a modal.
 * Provides an isClosing prop to children for animations
 * */
export interface WithAnimatedPortalProps {
  isClosing: boolean
  isOpen: boolean

  closePortal (): void

  terminatePortal (): void
}

export interface WithAnimatedPortalState {
  isOpen: boolean
  isClosing: boolean
}

export interface InternalProps {
  isModalOpen: boolean
  closeModal: () => void
}

const withAnimatedPortal = <P extends WithAnimatedPortalProps>(
  ComposedComponent: React.ComponentType<P>
) => {
  return class AnimatedPortal extends Component<
    InternalProps & Subtract<P, WithAnimatedPortalProps>,
    WithAnimatedPortalState
  > {
    static displayName = `AnimatedPortal(${getDisplayName(ComposedComponent)})`

    static getDerivedStateFromProps (
      nextProps: InternalProps,
      prevState: WithAnimatedPortalState
    ): Partial<WithAnimatedPortalState> | null {
      const {isOpen} = prevState
      const {isModalOpen} = nextProps
      if (isOpen === isModalOpen) return null
      const field = isModalOpen ? 'isOpen' : 'isClosing'
      return {[field]: true}
    }

    state = {
      isOpen: false,
      isClosing: false
    }

    closePortal = () => {
      this.props.closeModal()
      this.setState({
        isClosing: true
      })
    }

    terminatePortal = () => {
      if (this.state.isOpen) {
        this.setState({
          isClosing: false,
          isOpen: false
        })
      }
    }

    render () {
      const {isClosing, isOpen} = this.state
      return (
        // @ts-ignore
        <ComposedComponent
          {...this.props}
          isOpen={isOpen}
          isClosing={isClosing}
          closePortal={this.closePortal}
          terminatePortal={this.terminatePortal}
        />
      )
    }
  }
}

export default withAnimatedPortal
