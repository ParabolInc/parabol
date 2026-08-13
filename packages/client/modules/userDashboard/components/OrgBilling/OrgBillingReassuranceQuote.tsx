import {useState} from 'react'
import adam from '~/styles/theme/images/adam.jpeg'
import cliff from '~/styles/theme/images/cliff.jpeg'
import ian from '~/styles/theme/images/ian.png'
import {cn} from '../../../../ui/cn'

const quotes = [
  {
    text: 'Parabol’s software was the key to unlocking performance on our leadership team.',
    picture: ian,
    name: 'Ian Myers',
    title: 'GM of Platform at Quartz'
  },
  {
    text: 'We’re big fans of Parabol. It really helps our retrospectives be more efficient and more effective.',
    picture: cliff,
    name: 'Cliff des Ligneris',
    title: 'Senior Product Manager at Doodle'
  },
  {
    text: 'In 4 weeks we were running like a top: priorities and accountabilities are clear, and frankly, our meetings have been a lot more enjoyable.',
    picture: adam,
    name: 'Adam Pisoni',
    title: 'Founder and CEO at Abl Schools'
  }
]

interface Props {
  className?: string
}

const OrgBillingReassuranceQuote = (props: Props) => {
  const {className} = props
  const [quoteNumber] = useState(() => Math.floor(Math.random() * quotes.length))
  const {text, picture, name, title} = quotes[quoteNumber]!
  return (
    <div className={cn('flex flex-col text-[16px] leading-5', className)}>
      <div className='relative max-w-[280px] pb-3 italic'>
        <div className='absolute top-0 left-[-2em] w-[2em] text-right'>“</div>
        {text}”
      </div>
      <div className='flex items-center'>
        <div className="relative h-12 after:absolute after:top-0 after:left-0 after:z-[2] after:h-12 after:w-12 after:rounded-[100%] after:shadow-[inset_0_0_0_1px_rgba(0,0,0,.25)] after:content-['']">
          <img className='h-12 w-12 rounded-[100%]' src={picture} />
        </div>
        <div className='flex flex-col pl-4'>
          <div className='font-semibold leading-6'>{name}</div>
          <div className='text-[13px] text-fg-secondary'>{title}</div>
        </div>
      </div>
    </div>
  )
}

export default OrgBillingReassuranceQuote
