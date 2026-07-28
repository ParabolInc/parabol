import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {ConfluenceSummaryCta_page$key} from '../../__generated__/ConfluenceSummaryCta_page.graphql'
import {ExportToConfluenceRoot} from '../../components/ExportToConfluence/ExportToConfluenceRoot'
import {Button} from '../../ui/Button/Button'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'

interface Props {
  pageRef: ConfluenceSummaryCta_page$key
  isPageGenerating: boolean
}

export const ConfluenceSummaryCta = (props: Props) => {
  const {pageRef, isPageGenerating} = props
  const page = useFragment(
    graphql`
      fragment ConfluenceSummaryCta_page on Page {
        id
      }
    `,
    pageRef
  )
  const [exportOpen, setExportOpen] = useState(false)
  return (
    <div className='flex w-full max-w-3xl justify-start px-4 pt-20 print:hidden'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='outline' disabled={isPageGenerating} onClick={() => setExportOpen(true)}>
            {'Export to Confluence'}
          </Button>
        </TooltipTrigger>
        {isPageGenerating && (
          <TooltipContent>{'Available when the summary finishes generating'}</TooltipContent>
        )}
      </Tooltip>
      {exportOpen && (
        <ExportToConfluenceRoot
          pageId={page.id}
          onClose={() => setExportOpen(false)}
          entryPoint={'summaryCta'}
        />
      )}
    </div>
  )
}
