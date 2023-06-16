import {ReactElement} from 'react'
import ReactDOMServer from 'react-dom/server'
import ServerEnvironment from './ServerEnvironment'

const renderSSRElement = async (element: ReactElement, environment: ServerEnvironment) => {
  // initiate data requests
  ReactDOMServer.renderToStaticMarkup(element)

  // prime the cache
  await environment.load()

  // return html string
  const htmlString = ReactDOMServer.renderToStaticMarkup(element)

  // Relay has a memory leak that they won't fix: https://github.com/facebook/relay/pull/2883
  // To get around it, we destroy everything in the object so while it still exists, it's as small as possible
  environment.destroy()
  return htmlString
}

export default renderSSRElement
