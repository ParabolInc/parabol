import {forwardRef, type ReactNode, type Ref} from 'react'
import ErrorBoundary from './ErrorBoundary'

interface Props {
  children: ReactNode
}

const PhaseWrapper = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {children} = props
  return (
    <ErrorBoundary>
      {/* min-h-0 is a FF68 hack to allow discuss tasks to scroll & facilitatorbar to stay visible when shrinking viewpoint height */}
      <div ref={ref} className='flex h-full min-h-0 flex-1 flex-col items-center justify-center'>
        {children}
      </div>
    </ErrorBoundary>
  )
})
export default PhaseWrapper
