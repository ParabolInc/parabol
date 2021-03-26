import tracer from 'dd-trace'
tracer.init({
  enabled: process.env.DD_TRACE_ENABLED === 'true'
})
export default tracer
