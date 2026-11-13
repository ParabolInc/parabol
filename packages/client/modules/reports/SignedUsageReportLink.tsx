import {useState} from 'react'
import useSignUsageReportMutation from '../../mutations/useSignUsageReportMutation'

interface Props {
  orgId: string
}

// Downloads the instance's active users, signed with its private usage key, for the admin to send to Parabol
const SignedUsageReportLink = ({orgId}: Props) => {
  const [commit, signing] = useSignUsageReportMutation()
  const [error, setError] = useState<string | null>(null)
  const download = () => {
    setError(null)
    commit({
      variables: {orgId},
      onCompleted: ({signUsageReport}, errors) => {
        if (errors?.length) {
          setError(errors[0]!.message)
          return
        }
        const {file, fileName} = signUsageReport
        const url = URL.createObjectURL(new Blob([file], {type: 'application/json'}))
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        link.click()
        URL.revokeObjectURL(url)
      },
      onError: (e) => setError(e.message)
    })
  }
  return (
    <div className='flex flex-col gap-0.5 pt-1'>
      <button
        type='button'
        onClick={download}
        disabled={signing}
        className='w-fit cursor-pointer border-0 bg-transparent p-0 text-left font-semibold text-[13px] text-sky-600 hover:underline disabled:cursor-wait disabled:opacity-60 dark:text-accent'
      >
        {signing ? 'Signing…' : 'Signed usage report'}
      </button>
      {error && (
        <span role='alert' className='text-tomato-700 text-xs dark:text-tomato-300'>
          {error}
        </span>
      )}
    </div>
  )
}

export default SignedUsageReportLink
