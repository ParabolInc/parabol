import {trace} from '@opentelemetry/api'

const tracer = trace.getTracer('parabol-server')

export default tracer
