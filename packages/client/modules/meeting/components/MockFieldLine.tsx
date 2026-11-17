interface Props {
  delay: number
}

const MockFieldLine = (props: Props) => {
  const {delay} = props
  return (
    <div
      className='h-4 w-full animate-[skeleton-shine-sm_2400ms_linear_infinite] rounded-[20px] bg-[linear-gradient(90deg,var(--color-hairline-strong)_0px,var(--color-surface-well)_40px,var(--color-hairline-strong)_80px)] bg-size-[260px]'
      style={{animationDelay: `${delay}ms`}}
    />
  )
}

export default MockFieldLine
