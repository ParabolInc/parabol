import {Schedule} from '~/ui/icons'

interface Props {
  facilitatorName: string
  isEnded: boolean
}

const RetroTeamHealthNoCheck = (props: Props) => {
  const {facilitatorName, isEnded} = props
  return (
    <div className='flex w-full justify-center px-6 py-8'>
      <section className='flex w-full max-w-md flex-col items-center rounded-3xl bg-surface-card px-8 py-10 text-center shadow-card-raised'>
        <span className='flex size-14 items-center justify-center rounded-2xl bg-surface-well'>
          <Schedule className='text-fg-secondary' />
        </span>
        <h2 className='mt-6 mb-0 font-bold text-3xl text-fg-primary'>
          {isEnded ? 'No check ran in this retro' : 'No check is open yet'}
        </h2>
        {!isEnded && (
          <>
            <p className='mt-2 mb-0 text-balance text-fg-secondary'>
              {`${facilitatorName} can start one for the team. When a check starts, its questions show up right here.`}
            </p>
            <p className='mt-5 mb-0 text-fg-muted text-sm'>
              Anonymous · your individual answers are never shown to anyone
            </p>
          </>
        )}
      </section>
    </div>
  )
}

export default RetroTeamHealthNoCheck
