import {ContentCopy} from '@mui/icons-material'
import {useState} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {Tooltip} from '../../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../../ui/Tooltip/TooltipTrigger'

interface Props {
  label: string
  url: string
}
export const CopyServiceProviderURL = (props: Props) => {
  const {label, url} = props
  const title = `Copy the ${label}`
  const tooltip = `Copied! Paste it into your IdP`
  const [isOpen, setIsOpen] = useState(false)
  const onCopy = () => {
    setIsOpen(true)
    setTimeout(() => {
      setIsOpen(false)
    }, 2000)
  }

  return (
    <>
      <div className='leading-7 font-bold'>{label}</div>
      <CopyToClipboard text={url} title={title} tooltip={tooltip} onCopy={onCopy}>
        <div className='contents cursor-pointer'>
          <div className='break-all'>{url}</div>
          <Tooltip open={isOpen}>
            <TooltipTrigger asChild>
              <ContentCopy className='h-5 w-5 text-sky-500 hover:text-sky-700' />
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        </div>
      </CopyToClipboard>
    </>
  )
}
