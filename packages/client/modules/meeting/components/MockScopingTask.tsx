import Checkbox from '../../../components/Checkbox'

interface Props {
  idx: number
}
const MockScopingTask = (props: Props) => {
  const {idx} = props
  return (
    <div className='flex h-14 items-start p-4'>
      <Checkbox
        active={false}
        onClick={() => {
          /* noop */
        }}
      />
      <div
        className='mt-1 ml-2 h-4 w-4/5 animate-[skeleton-shine-lg_2400ms_linear_infinite] rounded-[20px] bg-[linear-gradient(90deg,var(--color-hairline-strong)_0px,var(--color-surface-well)_40px,var(--color-hairline-strong)_80px)] bg-size-[1200px]'
        style={{animationDelay: `${idx * 20}ms`}}
      />
    </div>
  )
}

export default MockScopingTask
