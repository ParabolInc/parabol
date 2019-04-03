import React, {ReactNode, ComponentType} from 'react'
import {TransitionGroup} from 'react-transition-group'
import AnimatedFade from 'universal/components/AnimatedFade'
import ErrorComponent from '../../components/ErrorComponent/ErrorComponent'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'

interface Options {
  Loader?: ReactNode
  Error?: ComponentType<{error: any}>
  props?: {[key: string]: any}
  size?: number
}

const renderQuery = (ReadyComponent: ComponentType<any>, options: Options = {}) => (readyState) => {
  const Loader = options.Loader || <LoadingComponent spinnerSize={options.size} />
  const Error = options.Error || ErrorComponent
  const {error, props, retry} = readyState
  let child
  let key
  if (error) {
    key = 'Error'
    child = <Error error={error} />
  } else if (props) {
    key = 'Ready'
    child = <ReadyComponent {...options.props || {}} viewer={props.viewer} retry={retry} />
  } else {
    key = 'Loading'
    child = Loader
  }
  return (
    <TransitionGroup appear component={React.Fragment}>
      <AnimatedFade key={key} exit={key !== 'Loading'} unmountOnExit={key === 'Loading'} slide={0}>
        {child}
      </AnimatedFade>
    </TransitionGroup>
  )
}

export default renderQuery
