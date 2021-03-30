import tracer from 'dd-trace'
tracer.init({
  enabled: process.env.DD_TRACE_ENABLED === 'true',
  env: process.env.DD_ENV ?? 'test'
})

tracer.use('graphql', {
  hooks: {
    execute: (span, args) => {
      span.setTag('viewerId', args?.contextValue?.authToken?.sub ?? "null")
    }
  }
})
export default tracer
