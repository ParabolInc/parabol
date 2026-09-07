import type * as React from 'react'
import {Done as DoneIcon, MoreVert as MoreVertIcon} from '~/ui/icons'
import ProviderActions from '../../../../components/ProviderActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {Breakpoint} from '../../../../types/constEnums'
import {Button} from '../../../../ui/Button/Button'
import {Menu} from '../../../../ui/Menu/Menu'

export interface ProviderRowEntryProps {
  name: string
  description: React.ReactElement | string
  error?: React.ReactNode
  connected: boolean
  connectButton: React.ReactElement
  configMenu: React.ReactNode
}

const ProviderRowEntry = (props: ProviderRowEntryProps) => {
  const {name, description, error, connected, connectButton, configMenu} = props
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  return (
    <>
      <RowInfo>
        <div className='mr-4 flex items-center align-middle font-semibold text-fg-primary leading-6'>
          {name}
        </div>
        <RowInfoCopy>{description} </RowInfoCopy>
        {!!error && (
          <div className='text-fg-error text-sm [&_a]:font-semibold [&_a]:text-fg-error [&_a]:underline'>
            {error}
          </div>
        )}
      </RowInfo>
      <ProviderActions>
        {!connected && connectButton}
        {connected && (
          <>
            {isDesktop && (
              <div className='flex items-center pr-[25px]'>
                <DoneIcon className='h-[18px] w-[18px] text-lg text-success-light' />
                <div className='pl-[6px] font-semibold text-fg-primary text-sm'>Connected</div>
              </div>
            )}
            <Menu
              trigger={
                <Button
                  variant='flat'
                  size='sm'
                  className={
                    isDesktop
                      ? 'min-w-[30px] border-hairline-strong pr-0 pl-0 font-semibold text-fg-primary text-sm'
                      : 'min-w-[36px] border-hairline-strong pr-0 pl-0 font-semibold text-fg-primary text-sm'
                  }
                >
                  {isDesktop ? (
                    <MoreVertIcon className='h-[18px] w-[18px] text-lg' />
                  ) : (
                    <MoreVertIcon />
                  )}
                </Button>
              }
            >
              {configMenu}
            </Menu>
          </>
        )}
      </ProviderActions>
    </>
  )
}

export default ProviderRowEntry
