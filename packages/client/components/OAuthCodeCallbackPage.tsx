import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {useEffect, useState} from 'react'
import {useSearchParams} from 'react-router'

const OAuthCodeCallbackPage = () => {
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const appName = searchParams.get('app_name')
  const scopeParam = searchParams.get('scope')
  const scopes = scopeParam ? scopeParam.split(' ') : []
  const [copied, setCopied] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(600)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [secondsLeft])

  const handleCopy = async () => {
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`

  if (!code) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[#F8F7FC]'>
        <div className='text-center'>
          <h2 className='font-semibold text-[#2D2D39] text-xl'>Invalid Request</h2>
          <p className='mt-2 text-[#82809A] text-sm'>No authorization code was provided.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-[#F8F7FC]'>
      <div className='w-full max-w-[480px] px-8 py-10 text-center'>
        {/* Success checkmark */}
        <div className='mb-2'>
          <span className='mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#CFF2DE]'>
            <CheckIcon style={{color: '#40B574', fontSize: 24}} />
          </span>
        </div>
        <h2 className='m-0 font-semibold text-[#2D2D39] text-xl'>Authorization Successful</h2>
        <p className='mt-1 mb-6 text-[#82809A] text-sm'>
          Copy this code and paste it into{' '}
          {appName ? <strong className='text-[#444258]'>{appName}</strong> : 'your application'}
        </p>

        {/* Code block */}
        <div className='relative mb-4 rounded-lg bg-[#2D1D53] px-5 py-4'>
          <div className='break-all pr-16 font-mono text-[#E0DDEC] text-base leading-relaxed tracking-wider'>
            {code}
          </div>
          <button
            onClick={handleCopy}
            className='absolute top-2 right-2 flex cursor-pointer items-center gap-1 rounded bg-[#493272] px-2.5 py-1 text-[#E0DDEC] text-xs hover:bg-[#7340B5]'
          >
            {copied ? (
              <>
                <CheckIcon style={{fontSize: 14}} /> Copied
              </>
            ) : (
              <>
                <ContentCopyIcon style={{fontSize: 14}} /> Copy
              </>
            )}
          </button>
        </div>

        {/* Scopes granted */}
        {scopes.length > 0 && (
          <div className='mb-4 rounded-lg border border-[#E0DDEC] bg-[#F8F7FC] px-4 py-3.5 text-left'>
            <div className='mb-2 font-semibold text-[#A7A3C2] text-xs uppercase tracking-wider'>
              Scopes Granted
            </div>
            <div className='flex flex-wrap gap-1.5'>
              {scopes.map((scope: string) => (
                <span
                  key={scope}
                  className='rounded bg-[#E8F4FC] px-2 py-0.5 font-mono text-[#14649E] text-xs'
                >
                  {scope}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expiration */}
        <div className='text-[#A7A3C2] text-xs'>
          {secondsLeft > 0 ? (
            <>
              This code expires in <strong className='text-[#82809A]'>{timeDisplay}</strong>
            </>
          ) : (
            <span className='text-[#FD6157]'>
              This code has expired. Please start the authorization flow again.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default OAuthCodeCallbackPage
