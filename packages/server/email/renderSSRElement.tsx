import {generateHTML, generateJSON} from '@tiptap/html/server'
import {ReactElement} from 'react'
import ReactDOMServer from 'react-dom/server'
import {RelayEnvironmentProvider} from 'react-relay'
import {TipTapProvider} from '../../client/components/TipTapProvider'
import {serverTipTapExtensions} from '../../client/shared/tiptap/serverTipTapExtensions'
import ServerEnvironment from './ServerEnvironment'

const renderSSRElement = async (element: ReactElement, environment: ServerEnvironment) => {
  const wrappedElement = (
    <TipTapProvider
      generateHTML={generateHTML}
      generateJSON={generateJSON}
      extensions={serverTipTapExtensions}
    >
      <RelayEnvironmentProvider environment={environment}>{element}</RelayEnvironmentProvider>
    </TipTapProvider>
  )

  // initiate data requests
  ReactDOMServer.renderToStaticMarkup(wrappedElement)

  // prime the cache
  await environment.load()

  // return html string
  return ReactDOMServer.renderToStaticMarkup(wrappedElement)
}

export default renderSSRElement
