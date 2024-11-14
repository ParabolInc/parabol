import {ReactElement} from 'react'
import ReactDOMServer from 'react-dom/server'
import {RelayEnvironmentProvider} from 'react-relay'
import ServerEnvironment from './ServerEnvironment'

const renderSSRElement = async (element: ReactElement, environment: ServerEnvironment) => {
  const wrappedElement = (
    <RelayEnvironmentProvider environment={environment}>{element}</RelayEnvironmentProvider>
  )

  // initiate data requests
  ReactDOMServer.renderToStaticMarkup(wrappedElement)

  // prime the cache
  await environment.load()

  // return html string
  return ReactDOMServer.renderToStaticMarkup(wrappedElement)
}

export default renderSSRElement
