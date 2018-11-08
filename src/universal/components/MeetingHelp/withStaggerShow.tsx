import React, {Component} from 'react'

const withStaggerShow = (ComposedComponent) => {
  return class WithStaggerShow extends Component<{}, {show: number}> {
    timeout: number
    constructor (props) {
      super(props)
      this.state = {show: 0}
      this.timeout = setInterval(() => {
        this.setState({
          show: this.state.show + 1
        })
      }, 1500)
    }
    componentWillUnmount () {
      clearInterval(this.timeout)
    }
    render () {
      return <ComposedComponent staggerShow={this.state.show} {...this.props} />
    }
  }
}

export default withStaggerShow
