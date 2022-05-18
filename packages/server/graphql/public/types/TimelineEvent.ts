import {timelineEventInterfaceFields} from '../../types/TimelineEvent'

export const timelineEventInterfaceResolvers = () =>
  Object.fromEntries(
    Object.entries(timelineEventInterfaceFields())
      .filter(([_, value]) => !!value.resolve)
      .map(([key, value]) => [key, value.resolve])
  )

export default timelineEventInterfaceResolvers()
