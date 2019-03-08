import React, {Component} from 'react'

const withDemoHelpMenu = (ComposedComponent) => {
  return class WithDemoHelpMenu extends Component {
    helpToggleRef = React.createRef<HTMLDivElement>()
    componentDidMount() {
      setTimeout(() => {
        const toggle = this.helpToggleRef.current
        toggle && toggle.click()
      }, 1000)
    }
    render() {
      return (
        <ComposedComponent toggleRef={this.helpToggleRef} floatAboveBottomBar {...this.props} />
      )
    }
  }
}

export default withDemoHelpMenu
