import React, {ComponentType, forwardRef, Ref} from 'react'

export interface WithInnerRefProps<T> {
  innerRef?: Ref<T>
}

// all this says is that we're gonna stick an innerRef prop on the component if one doesn't already exist
const withInnerRef = <T, P extends WithInnerRefProps<T>>(ComposedComponent: ComponentType<P>) =>
  forwardRef((props: P, ref: Ref<T> | undefined) => <ComposedComponent innerRef={ref} {...props} />)

export default withInnerRef
