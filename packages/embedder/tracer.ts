import tracer from 'dd-trace'

tracer.init({
  service: `embedder`,
  appsec: process.env.DD_APPSEC_ENABLED === 'true',
  plugins: false,
  version: __APP_VERSION__
})

// The embedder queue is in PG & gets hits non-stop, which dirties up the logs. Ignore the polling query before enabling pg
// tracer.use('pg')

export default tracer
