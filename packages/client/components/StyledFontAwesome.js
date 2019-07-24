import * as React from 'react'
import FontAwesome from 'react-fontawesome'

const domProps = ['onClick', 'onMouseEnter', 'onMouseLeave', 'title']
const propSet = new Set([...Object.keys(FontAwesome.propTypes), ...domProps])

// eslint-disable-next-line react/prefer-stateless-function
class StyledFontAwesome extends React.Component {
  render () {
    const goodProps = {}
    Object.keys(this.props).forEach((propName) => {
      if (propSet.has(propName)) {
        goodProps[propName] = this.props[propName]
      }
    })
    return <FontAwesome {...goodProps} />
  }
}

export default StyledFontAwesome
