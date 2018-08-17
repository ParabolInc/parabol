import React from 'react'
import ReflectionStackPlaceholder from 'universal/components/RetroReflectPhase/ReflectionStackPlaceholder'

interface Props {
  idx: number
  reflectionStack: Array<any>
}

const ReflectionStack = (props: Props) => {
  const {idx, reflectionStack} = props
  if (reflectionStack.length === 0) {
    return <ReflectionStackPlaceholder idx={idx}/>
  }
  return <div>hi</div>
}

export default ReflectionStack
