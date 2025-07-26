import AutoModeIcon from '@mui/icons-material/AutoMode'
import type {NodeViewProps} from '@tiptap/core'
export const InsightsBlockNoData = (props: NodeViewProps) => {
  const {updateAttributes} = props
  return (
    <div
      contentEditable={false}
      className='flex items-center justify-center gap-4 rounded-lg p-4 text-sm text-slate-800 select-none'
    >
      <div className='flex items-center justify-center rounded-full p-2'>
        {/* Replace with your actual icon if needed */}
        <AutoModeIcon className='size-12 text-slate-600' />
      </div>
      <div className='flex flex-col'>
        <div>
          <span className='font-semibold'>Oops!</span> There's not enough data to generate insights.
        </div>
        <div className=''>
          <button
            className='cursor-pointer bg-inherit font-semibold text-sky-500'
            onClick={() => {
              updateAttributes({editing: true, error: undefined})
            }}
          >
            Try different selections
          </button>{' '}
          and run again
        </div>
      </div>
    </div>
  )
}
