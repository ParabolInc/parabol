import type {ErrorComponentProps} from '@tanstack/react-router'

// Sends a route's error on to the app's own error boundary, which reports it and offers a reload
const RethrowRouteError = ({error}: ErrorComponentProps) => {
  throw error
}

export default RethrowRouteError
