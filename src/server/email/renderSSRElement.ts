import {ReactElement} from 'react'
import ReactDOMServer from 'react-dom/server'

const renderSSRElement = async (element: ReactElement, getData: Promise<any>) => {
  // initiate request
  ReactDOMServer.renderToStaticMarkup(element)
  // prime with data
  const res = await getData
  const bodyContent = ReactDOMServer.renderToStaticMarkup(element)
  return {res, bodyContent}
}

export default renderSSRElement
