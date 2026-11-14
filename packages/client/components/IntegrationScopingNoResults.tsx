import {Info as InfoIcon, Warning} from '~/ui/icons'

interface Props {
  error?: string | null
  msg?: string | null
}

const IntegrationScopingNoResults = (props: Props) => {
  const {error, msg} = props
  return (
    <div className='mx-auto mt-16 mb-auto flex items-center justify-center rounded border border-hairline-strong border-dashed px-4 py-2 text-[14px] text-fg-secondary italic leading-8'>
      <div className='mr-4 h-6 w-6'>{error ? <Warning /> : <InfoIcon />}</div>
      {error || msg || 'No records found'}
    </div>
  )
}

export default IntegrationScopingNoResults
