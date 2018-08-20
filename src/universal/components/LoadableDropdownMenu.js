import React from 'react'
import {findDOMNode} from 'react-dom'
import LoadableMenu from 'universal/components/LoadableMenu'

class LoadableDropdownMenu extends React.Component {
  state = {
    width: 200
  }
  setToggleRef = (c) => {
    if (c) {
      const node = findDOMNode(c)
      this.setState({
        width: node.getBoundingClientRect().width
      })
    }
  }

  render () {
    const {width} = this.state
    const toggle = React.cloneElement(this.props.toggle, {
      ref: this.setToggleRef
    })
    return <LoadableMenu {...this.props} minWidth={width} maxWidth={width} toggle={toggle} />
  }
}

export default LoadableDropdownMenu
