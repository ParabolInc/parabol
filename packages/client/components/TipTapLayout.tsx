import {generateHTML, generateJSON} from '@tiptap/core'
import {Outlet} from 'react-router'
import {serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import {TipTapProvider} from './TipTapProvider'

const TipTapLayout = () => {
  return (
    <TipTapProvider
      generateHTML={generateHTML}
      generateJSON={generateJSON}
      extensions={serverTipTapExtensions}
    >
      <Outlet />
    </TipTapProvider>
  )
}

export default TipTapLayout
