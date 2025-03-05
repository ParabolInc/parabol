import type {NodeViewProps} from '@tiptap/core'
import {Suspense} from 'react'
import type {TeamPickerComboboxQuery} from '../__generated__/TeamPickerComboboxQuery.graphql'
import query from '../__generated__/TeamPickerComboboxQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import type {InsightsBlockAttrs} from '../tiptap/extensions/insightsBlock/InsightsBlock'
import {Loader} from '../utils/relay/renderLoader'
import {TeamPickerCombobox} from './TeamPickerCombobox'

interface Props {
  updateAttributes: NodeViewProps['updateAttributes']
  attrs: InsightsBlockAttrs
}

export const TeamPickerComboboxRoot = (props: Props) => {
  const {attrs, updateAttributes} = props
  const queryRef = useQueryLoaderNow<TeamPickerComboboxQuery>(query)
  return (
    <Suspense fallback={<Loader />}>
      {queryRef && (
        <TeamPickerCombobox queryRef={queryRef} attrs={attrs} updateAttributes={updateAttributes} />
      )}
    </Suspense>
  )
}
