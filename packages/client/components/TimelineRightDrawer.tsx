import graphql from 'babel-plugin-relay/macro'
import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {useFragment} from 'react-relay'
import type {TimelineRightDrawer_viewer$key} from '../__generated__/TimelineRightDrawer_viewer.graphql'
import {cn} from '../ui/cn'
import ErrorBoundary from './ErrorBoundary'
import TimelinePriorityTasks from './TimelinePriorityTasks'

interface Props {
  viewer: TimelineRightDrawer_viewer$key
}

export const RightDrawer = forwardRef(
  (props: ComponentPropsWithoutRef<'div'>, ref: Ref<HTMLDivElement>) => {
    const {className, children, ...rest} = props
    return (
      <div
        ref={ref}
        className={cn(
          'hidden h-auto min-w-[336px] max-w-[336px] border-hairline-strong border-l p-4 min-[920px]:block',
          className
        )}
        {...rest}
      >
        {children}
      </div>
    )
  }
)

const TimelineRightDrawer = (props: Props) => {
  const {viewer: viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment TimelineRightDrawer_viewer on User {
        ...TimelinePriorityTasks_viewer
      }
    `,
    viewerRef
  )
  return (
    <RightDrawer>
      <ErrorBoundary>
        <TimelinePriorityTasks viewer={viewer} />
      </ErrorBoundary>
    </RightDrawer>
  )
}

export default TimelineRightDrawer
