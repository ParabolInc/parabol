import type {NodeViewProps} from '@tiptap/core'
import {Suspense} from 'react'
import type {SpecificMeetingPickerQuery} from '../__generated__/SpecificMeetingPickerQuery.graphql'
import query from '../__generated__/TeamPickerComboboxQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import type {InsightsBlockAttrs} from '../tiptap/extensions/insightsBlock/InsightsBlock'
import {Loader} from '../utils/relay/renderLoader'
import {SpecificMeetingPicker} from './SpecificMeetingPicker'

interface Props {
  updateAttributes: NodeViewProps['updateAttributes']
  attrs: InsightsBlockAttrs
}

export const SpecificMeetingPickerRoot = (props: Props) => {
  const {attrs, updateAttributes} = props
  const {teamIds, meetingTypes, after, before} = attrs
  const queryRef = useQueryLoaderNow<SpecificMeetingPickerQuery>(query, {
    teamIds,
    meetingTypes,
    after,
    before,
    first: 500
  })

  return (
    <Suspense fallback={<Loader />}>
      {queryRef && (
        <SpecificMeetingPicker
          queryRef={queryRef}
          attrs={attrs}
          updateAttributes={updateAttributes}
        />
      )}
    </Suspense>
  )
}
