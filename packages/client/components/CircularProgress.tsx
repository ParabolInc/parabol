interface Props {
  className?: string
  radius: number
  progress: number
  stroke: string
  thickness: number
}

const CircularProgress = (props: Props) => {
  const {className, radius, progress, stroke, thickness} = props
  const normalizedRadius = radius - thickness
  const circumference = normalizedRadius * 2 * Math.PI

  return (
    <svg className={className} style={{height: radius * 2, width: radius * 2}}>
      <circle
        className='origin-center fill-transparent transition-[stroke-dashoffset] duration-300 ease-[cubic-bezier(0,0,.2,1)] [transform:rotate(-90deg)]'
        style={{
          stroke,
          strokeDasharray: circumference.toFixed(3),
          strokeDashoffset: circumference - progress * circumference
        }}
        strokeWidth={thickness}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  )
}

export default CircularProgress
