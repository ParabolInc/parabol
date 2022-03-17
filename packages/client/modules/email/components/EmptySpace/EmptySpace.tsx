// EmptySpace:
// Table-based way to add vertical space. Uses line-height.

import React from 'react'
import {emailTableBase} from '../../styles'

const EmptySpace = (props: {height: number}) => {
  const cellStyle = {
    lineHeight: `${props.height}px`,
    fontSize: '1px',
    msoLineHeightRule: 'exactly',
    padding: 0
  }

  return (
    <table style={emailTableBase} width='100%'>
      <tbody>
        <tr>
          <td
            dangerouslySetInnerHTML={{__html: '&nbsp;'}}
            height={`${props.height}px`}
            style={cellStyle}
            width='100%'
          />
        </tr>
      </tbody>
    </table>
  )
}

export default EmptySpace
