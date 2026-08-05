interface Props {
  number: number
  step: string
}

const HowToStepItem = (props: Props) => {
  const {number, step} = props
  return (
    <>
      <div className='col-start-1 col-end-2 h-8 w-8 rounded-full bg-slate-600 text-center font-semibold text-[16px] text-white leading-8'>
        {number}
      </div>
      <div className='col-start-2 self-center'>{step}</div>
    </>
  )
}

export default HowToStepItem
