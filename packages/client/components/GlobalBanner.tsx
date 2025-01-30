import clsx from 'clsx'

interface Props {
  bgColor: string
  color: string
  text: string
}

// https://www.astrouxds.com/components/classification-markings/#banner-examples

// Note: banner height is 24px per Tailwind settings (Scale of 6: h-6, leading-6, p-6, etc.)
// This height value is also in constEnums GlobalBanner

const GlobalBanner = (props: Props) => {
  const {bgColor, color, text} = props
  return (
    <div className='h-6 max-h-6 w-full pt-6'>
      {/* Container div creates natural height to push down
          container wrapping <Switch /> in Action.tsx.
          Meanwhile the main div here is postion: fixed. */}
      <div
        className={clsx(
          'bg-jade-600',
          'block',
          'fixed',
          'font-bold',
          'h-6',
          'leading-6',
          'left-0',
          'max-h-6',
          'text-center',
          'text-white',
          'top-0',
          'uppercase',
          'w-full',
          'z-50'
        )}
        style={{
          backgroundColor: bgColor,
          color
        }}
      >
        {text}
      </div>
    </div>
  )
}

export default GlobalBanner
