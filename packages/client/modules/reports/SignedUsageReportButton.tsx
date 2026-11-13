import {VerifiedUser} from '~/ui/icons'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import getMutationError from '~/utils/relay/getMutationError'
import useAtmosphere from '../../hooks/useAtmosphere'
import useSignUsageReportMutation from '../../mutations/useSignUsageReportMutation'

interface Props {
  orgId: string
}

// Downloads the instance's active users, signed with its private usage key, for the admin to send to Parabol
const SignedUsageReportButton = ({orgId}: Props) => {
  const atmosphere = useAtmosphere()
  const [commit, signing] = useSignUsageReportMutation()
  const showError = (message: string) => {
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: 'signUsageReportError',
      message,
      autoDismiss: 5
    })
  }
  const download = () => {
    if (signing) return
    commit({
      variables: {orgId},
      onCompleted: (response, errors) => {
        const report = response?.signUsageReport
        if (errors?.[0] || !report) {
          showError(errors?.[0]?.message ?? 'The usage report couldn’t be signed')
          return
        }
        const url = URL.createObjectURL(new Blob([report.file], {type: 'application/json'}))
        const link = document.createElement('a')
        link.href = url
        link.download = report.fileName
        link.click()
        URL.revokeObjectURL(url)
      },
      onError: (error) => showError(getMutationError(error).message)
    })
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          onClick={download}
          aria-busy={signing || undefined}
          className='inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-hairline-strong bg-transparent pr-3 pl-2.5 font-semibold text-fg-primary text-sm hover:bg-surface-hover aria-busy:cursor-wait'
        >
          <VerifiedUser className='text-[18px] text-fg-secondary' />
          <span className='grid text-left'>
            <span className='invisible col-start-1 row-start-1'>Signed usage report</span>
            <span className='col-start-1 row-start-1'>
              {signing ? 'Signing…' : 'Signed usage report'}
            </span>
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side='bottom'>
        Download this instance’s active users, signed so Parabol can tell they weren’t changed
      </TooltipContent>
    </Tooltip>
  )
}

export default SignedUsageReportButton
