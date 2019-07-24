import {ReactElement} from 'react'
import ReactDOMServer from 'react-dom/server'
import ServerEnvironment from './ServerEnvironment'

const renderSSRElement = async (element: ReactElement, environment: ServerEnvironment) => {
  // initiate data requests
  ReactDOMServer.renderToStaticMarkup(element)

  // prime the cache
  await environment.load()

  // return html string
  return ReactDOMServer.renderToStaticMarkup(element)
}

export default renderSSRElement
