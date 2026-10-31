import {trace} from '@opentelemetry/api'
import getSpanLogContext from './getSpanLogContext'

// the active span is a resolver's or the operation's, so a line lands on the span that wrote it
const getActiveSpanLogContext = () => {
  const spanContext = trace.getActiveSpan()?.spanContext()
  if (!spanContext || !trace.isSpanContextValid(spanContext)) return undefined
  return getSpanLogContext(spanContext)
}

export default getActiveSpanLogContext
