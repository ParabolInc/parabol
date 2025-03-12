import type {NodeViewProps} from '@tiptap/core'
import {Suspense} from 'react'
import type {InsightsBlockPromptQuery} from '../../../__generated__/InsightsBlockPromptQuery.graphql'
import query from '../../../__generated__/InsightsBlockPromptQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {Loader} from '../../../utils/relay/renderLoader'
import type {InsightsBlockAttrs} from './InsightsBlock'
import {InsightsBlockPrompt} from './InsightsBlockPrompt'

interface Props {
  updateAttributes: NodeViewProps['updateAttributes']
  attrs: InsightsBlockAttrs
}

export const InsightsBlockPromptRoot = (props: Props) => {
  const {attrs, updateAttributes} = props
  const queryRef = useQueryLoaderNow<InsightsBlockPromptQuery>(query)
  return (
    <Suspense fallback={<Loader />}>
      {queryRef && (
        <InsightsBlockPrompt
          queryRef={queryRef}
          attrs={attrs}
          updateAttributes={updateAttributes}
        />
      )}
    </Suspense>
  )
}
