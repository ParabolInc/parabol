import React from 'react'

const isReactTouch = (e: React.MouseEvent | React.TouchEvent): e is React.TouchEvent => {
  return (e as any).touches !== undefined
}

export default isReactTouch
