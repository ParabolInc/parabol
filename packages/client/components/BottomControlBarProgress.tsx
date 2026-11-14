import CircularProgress from './CircularProgress'

interface Props {
  isNext: boolean
  progress: number
}

const BottomControlBarProgress = (props: Props) => {
  const {isNext, progress} = props
  return (
    <CircularProgress
      className='-translate-y-1.5 absolute'
      radius={12}
      progress={progress}
      stroke={isNext ? 'var(--color-rose-500)' : 'var(--color-jade-400)'}
      thickness={2}
    />
  )
}

export default BottomControlBarProgress
