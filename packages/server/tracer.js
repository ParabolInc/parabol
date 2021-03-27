import tracer from 'dd-trace'
tracer.init({
  enabled: process.env.DD_TRACE_ENABLED === 'true',
  env: process.env.DD_ENV ?? 'test'
})

export default tracer
