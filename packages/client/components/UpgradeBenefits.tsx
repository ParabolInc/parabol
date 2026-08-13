import {CheckCircle} from '~/ui/icons'

const benefits = ['Unlimited Teams', 'Priority Customer Support', 'Monthly Active User Billing']

const UpgradeBenefits = () => {
  return (
    <div className='flex flex-col'>
      {benefits.map((benefit, idx) => {
        return (
          <p
            key={`modalBulletCopy-${idx + 1}`}
            className='m-0 flex items-center justify-start text-[15px] leading-8'
          >
            <CheckCircle className='mr-2 h-[18px] w-[18px] text-jade-400 opacity-100' />
            {benefit}
          </p>
        )
      })}
    </div>
  )
}

export default UpgradeBenefits
