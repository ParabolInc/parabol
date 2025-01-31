import {Done as DoneIcon, MoreVert as MoreVertIcon} from '@mui/icons-material'
import * as React from 'react'
import FlatButton from '../../../../components/FlatButton'
import ProviderActions from '../../../../components/ProviderActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {Breakpoint} from '../../../../types/constEnums'

export interface ProviderRowBaseProps {
  connected: boolean
  togglePortal: () => void
  menuRef: React.MutableRefObject<HTMLButtonElement | null> // TODO: make generic menu component
  providerName: string
  providerDescription: React.ReactElement | string
  providerLogo: React.ReactElement
  children?: React.ReactElement | false
  connectButton: React.ReactElement
  error?: React.ReactElement | string
}

const ProviderRowBase = (props: ProviderRowBaseProps) => {
  const {
    connectButton,
    connected,
    error,
    togglePortal,
    menuRef,
    providerName,
    providerDescription,
    providerLogo,
    children
  } = props
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  return (
    <div className='relative my-4 flex w-full shrink-0 flex-col justify-start rounded-sm bg-white shadow-card'>
      <div className='flex justify-start p-row-gutter'>
        {providerLogo}
        <RowInfo>
          <div className='mr-4 flex items-center align-middle leading-6 font-semibold text-slate-700'>
            {providerName}
          </div>
          <RowInfoCopy>{providerDescription} </RowInfoCopy>
          {!!error && (
            <div className='text-sm text-tomato-500 [&_a]:font-semibold [&_a]:text-tomato-500 [&_a]:underline'>
              {error}
            </div>
          )}
        </RowInfo>
        <ProviderActions>
          {!connected && connectButton}
          {connected && (
            <>
              {isDesktop ? (
                <>
                  <div className='flex items-center pr-[25px]'>
                    <DoneIcon className='h-[18px] w-[18px] text-lg text-success-light' />
                    <div className='pl-[6px] text-sm font-semibold text-slate-700'>Connected</div>
                  </div>
                  <FlatButton
                    className='min-w-[30px] border-slate-400 pr-0 pl-0 text-sm font-semibold text-slate-700'
                    onClick={togglePortal}
                    ref={menuRef}
                  >
                    <MoreVertIcon className='h-[18px] w-[18px] text-lg' />
                  </FlatButton>
                </>
              ) : (
                <FlatButton
                  className='min-w-[36px] border-slate-400 pr-0 pl-0 text-sm font-semibold text-slate-700'
                  onClick={togglePortal}
                  ref={menuRef}
                >
                  <MoreVertIcon />
                </FlatButton>
              )}
            </>
          )}
        </ProviderActions>
      </div>
      {children}
    </div>
  )
}

export default ProviderRowBase
