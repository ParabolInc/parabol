import React from 'react'

const isReactTouch = (e: React.MouseEvent | React.TouchEvent): e is React.TouchEvent => {
  return e.type === 'touchstart'
}

export default isReactTouch
