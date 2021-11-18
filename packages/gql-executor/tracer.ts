import tracer from 'dd-trace'

if (process.env.DD_TRACE_ENABLED === 'true') {
  tracer.init({
    plugins: false
  })
}
export default tracer
