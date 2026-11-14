import purpleLines from '../styles/theme/images/purpleLines.svg'

interface Props {
  height: string | number
}

const SpotlightResultsEmptyState = (props: Props) => {
  const {height} = props
  return (
    <div className='flex min-h-40 flex-wrap content-center justify-center' style={{height}}>
      <div className='w-full pb-1 text-center'>😔</div>
      <div className='flex items-center'>
        <img className='h-6 w-6' src={purpleLines} />
        <div className='flex h-fit flex-col px-2'>
          <div className='flex justify-center text-center text-fg-primary text-sm'>
            No reflections match this card.
          </div>
          <div className='flex justify-center text-center text-fg-primary text-sm'>
            Try searching for specific keywords.
          </div>
        </div>
        <img className='-scale-x-100 h-6 w-6' src={purpleLines} />
      </div>
    </div>
  )
}

export default SpotlightResultsEmptyState
