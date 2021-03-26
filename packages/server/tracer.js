import tracer from 'dd-trace'
tracer.init({
  enabled: process.env.DD_TRACE_ENABLED ?? false
})
export default tracer
