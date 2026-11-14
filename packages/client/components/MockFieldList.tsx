import {forwardRef} from 'react'
import MockFieldLine from '../modules/meeting/components/MockFieldLine'

// forwardRef is just here to ignore warnings when this appears in a menu
const MockFieldList = forwardRef(() => {
  return (
    <div className='px-4'>
      {Array.from(Array(3).keys()).map((idx) => {
        return (
          <div className='py-2' key={idx}>
            <MockFieldLine delay={idx * 40} />
          </div>
        )
      })}
    </div>
  )
})

export default MockFieldList
