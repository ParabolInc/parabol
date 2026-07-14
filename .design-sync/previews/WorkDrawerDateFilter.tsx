import {WorkDrawerDateFilter} from 'parabol-client'

// Only the "Any time" (no active range) state renders standalone: an active range
// shows a ClearFilterIcon whose Radix Tooltip needs a TooltipProvider the harness
// doesn't mount, so that variant is omitted here.
export const AnyTime = () => (
  <WorkDrawerDateFilter dateRange={undefined} setDateRange={() => {}} />
)
