import tracer from 'dd-trace'
import PROD from '../server/PROD'
if (PROD) {
  tracer.init()
}

tracer.use('graphql', {
  hooks: {
    execute: (span, args) => {
      span.setTag('viewerId', args?.contextValue?.authToken?.sub ?? "null")
    }
  }
})
export default tracer
