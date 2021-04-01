import tracer from 'dd-trace'
tracer.init()

tracer.use('graphql', {
  hooks: {
    execute: (span, args) => {
      span.setTag('viewerId', args?.contextValue?.authToken?.sub ?? "null")
    }
  }
})
export default tracer
