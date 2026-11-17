import {Fragment} from '@tiptap/pm/model'
import {Editor, getHTMLFromFragment, NodeViewContent, type NodeViewProps} from '@tiptap/react'
import {serverTipTapExtensions} from '~/shared/tiptap/serverTipTapExtensions'
import {ContentCopy as ContentCopyIcon, Edit as EditIcon} from '~/ui/icons'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
export const InsightsBlockResult = (props: NodeViewProps) => {
  const {editor, node, updateAttributes} = props
  return (
    <>
      <div className='flex justify-end space-x-2'>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className='cursor-pointer text-fg-secondary hover:text-fg-primary'
              onClick={async () => {
                const htmlFragment = Fragment.from(node)
                const htmlText = getHTMLFromFragment(htmlFragment, editor.schema)

                const innerFragment = node.content
                const innerText = getHTMLFromFragment(innerFragment, editor.schema)
                const tmpEditor = new Editor({
                  contentType: 'html',
                  content: innerText,
                  extensions: serverTipTapExtensions
                })
                const markdownText = tmpEditor.getMarkdown()
                await navigator.clipboard.write([
                  new ClipboardItem({
                    'text/plain': new Blob([markdownText], {
                      type: 'text/plain'
                    }),
                    'text/html': new Blob([htmlText], {type: 'text/html'})
                  })
                ])
              }}
            >
              <ContentCopyIcon />
            </button>
          </TooltipTrigger>
          <TooltipContent side='bottom' align='center'>
            {'Copy'}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className='cursor-pointer text-fg-secondary hover:text-fg-primary'
              onClick={() => {
                updateAttributes({editing: true})
              }}
            >
              <EditIcon />
            </button>
          </TooltipTrigger>
          <TooltipContent side='bottom' align='center'>
            {'Edit query'}
          </TooltipContent>
        </Tooltip>
      </div>
      <NodeViewContent className='px-4 outline-hidden' />
    </>
  )
}
