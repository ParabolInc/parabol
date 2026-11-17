const dotClassName =
  'inline-block animate-[ellipsis-blink_0.8s_infinite] align-baseline font-semibold'

const Ellipsis = () => {
  return (
    <span>
      <span className={dotClassName}>.</span>
      <span className={`${dotClassName} [animation-delay:200ms]`}>.</span>
      <span className={`${dotClassName} [animation-delay:400ms]`}>.</span>
    </span>
  )
}

export default Ellipsis
