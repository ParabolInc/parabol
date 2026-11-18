import {Suspense} from 'react'
import retroTemplatePickerQuery, {
  type RetroTemplatePickerQuery
} from '../../__generated__/RetroTemplatePickerQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {Spinner} from '../../ui/Spinner/Spinner'
import RetroTemplatePicker from './RetroTemplatePicker'

interface Props {
  meetingId: string
}

const RetroTemplatePickerRoot = ({meetingId}: Props) => {
  const queryRef = useQueryLoaderNow<RetroTemplatePickerQuery>(
    retroTemplatePickerQuery,
    {meetingId, first: 2000},
    'store-and-network'
  )
  const fallback = (
    <div className='flex flex-1 justify-center p-6'>
      <Spinner className='h-6 w-6' />
    </div>
  )
  return (
    <Suspense fallback={fallback}>
      {queryRef ? <RetroTemplatePicker queryRef={queryRef} /> : fallback}
    </Suspense>
  )
}

export default RetroTemplatePickerRoot
