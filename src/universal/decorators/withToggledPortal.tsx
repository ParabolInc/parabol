import React, {Component, ReactElement} from 'react'
import {findDOMNode} from 'react-dom'
import {Subtract} from 'types/generics'
import getDisplayName from 'universal/utils/getDisplayName'
import isKeyboardEvent from 'universal/utils/isKeyboardEvent'

/*
 * Takes the child component and puts it in a modal.
 * Provides an isClosing prop to children for animations
 * */
export interface WithToggledPortalProps {
  isClosing: boolean
  isOpen: boolean

  closePortal (): void

  terminatePortal (): void
}

export interface WithTogglePortalState {
  isOpen: boolean
  isClosing: boolean
}

export interface InternalProps {
  isToggleNativeElement?: boolean

  onClose? (): void

  toggle: ReactElement<any>
  LoadableComponent: any

  setOriginRef? (c: HTMLElement): void
}

const withToggledPortal = <P extends WithToggledPortalProps>(
  ComposedComponent: React.ComponentType<P>
) => {
  return class ToggledPortal extends Component<
    InternalProps & Subtract<P, WithToggledPortalProps>,
    WithTogglePortalState
  > {
    static displayName = `ToggledPortal(${getDisplayName(ComposedComponent)})`
    state = {
      isOpen: false,
      isClosing: false
    }

    smartToggle: ReactElement<any>
    toggleRef?: HTMLElement

    constructor (props) {
      super(props)
      const {toggle} = props
      this.smartToggle = this.makeSmartToggle(toggle)
    }

    componentWillReceiveProps (nextProps) {
      const {toggle} = nextProps
      if (this.props.toggle !== toggle) {
        this.smartToggle = this.makeSmartToggle(toggle)
      }
    }

    openPortal = () => {
      this.setState({
        isOpen: true,
        isClosing: false
      })
    }

    closePortal = (e?: Event) => {
      this.setState({
        isClosing: true
      })

      if (isKeyboardEvent(e) && this.toggleRef) {
        const node = findDOMNode(this.toggleRef) as HTMLElement
        node && node.focus()
      }
    }

    terminatePortal = () => {
      if (this.state.isOpen) {
        this.setState({
          isClosing: false,
          isOpen: false
        })
      }
    }

    makeSmartToggle (toggle: ReactElement<any>) {
      // strings are plain DOM nodes
      return React.cloneElement(toggle, {
        'aria-haspopup': 'true',
        'aria-expanded': this.state.isOpen,
        onClick: (e) => {
          const {setOriginRef, LoadableComponent} = this.props
          // check for preload() method in case we didn’t make a component loadable
          if (LoadableComponent && LoadableComponent.preload) {
            LoadableComponent.preload()
          }
          if (setOriginRef) {
            setOriginRef(e.currentTarget)
          }
          if (this.state.isOpen) {
            this.closePortal()
          } else {
            this.openPortal()
          }
          // if the modal was gonna do something, do it
          const {onClick} = toggle.props
          if (onClick) {
            onClick(e)
          }
        },
        onMouseEnter: () => {
          const {LoadableComponent} = this.props
          // check for preload() method in case we didn’t make a component loadable
          if (LoadableComponent && LoadableComponent.preload) {
            LoadableComponent.preload()
          }
        },
        [this.props.isToggleNativeElement ? 'ref' : 'innerRef']: (c) => {
          this.toggleRef = c
        }
      })
    }

    render () {
      const {isClosing, isOpen} = this.state

      return (
        <React.Fragment>
          {this.smartToggle}
          {/*
          // @ts-ignore */}
          <ComposedComponent
            {...this.props}
            isOpen={isOpen}
            isClosing={isClosing}
            closePortal={this.closePortal}
            terminatePortal={this.terminatePortal}
          />
        </React.Fragment>
      )
    }
  }
}

export default withToggledPortal
