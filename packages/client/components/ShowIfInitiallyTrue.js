import * as React from 'react'

class ShowIfInitiallyTrue extends React.Component {
  state = {
    initialCriteria: this.props.criteria
  }

  updateInitialValue = () => {
    this.setState({
      initialCriteria: this.props.criteria
    })
  }
  render() {
    const {initialCriteria} = this.state
    const {children} = this.props
    if (!initialCriteria) return null
    return children(this.updateInitialValue)
  }
}

export default ShowIfInitiallyTrue
