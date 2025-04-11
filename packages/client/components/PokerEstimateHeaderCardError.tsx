import styled from '@emotion/styled'
import DeleteIcon from '@mui/icons-material/Delete'
import useBreakpoint from '../hooks/useBreakpoint'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {Breakpoint} from '../types/constEnums'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'

const ErrorCard = styled('div')({
  alignItems: 'flex-start',
  background: PALETTE.WHITE,
  borderRadius: 4,
  boxShadow: Elevation.Z1,
  padding: '12px 8px 12px 16px',
  maxWidth: 1504, // matches widest dimension column 1600 - padding etc.
  margin: '0 auto',
  width: '100%'
})
const HeaderCardWrapper = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  display: 'flex',
  padding: isDesktop ? '0px 16px 4px' : '0px 8px 4px'
}))

const HeaderCard = styled('div')({
  background: PALETTE.WHITE,
  borderRadius: 4,
  boxShadow: Elevation.Z1,
  height: '100%',
  padding: '12px 16px',
  position: 'relative',
  maxWidth: 1504, // matches widest dimension column 1600 - padding etc.
  margin: '0 auto',
  width: '100%'
})

const CardTitle = styled('h1')({
  fontSize: 16,
  lineHeight: '24px',
  margin: '0 0 8px'
})

const CardTitleWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  width: '100%'
})

const CardDescription = styled('div')<{isExpanded: boolean}>(({isExpanded}) => ({
  color: PALETTE.SLATE_700,
  fontWeight: 'normal',
  lineHeight: '20px',
  fontSize: 14,
  margin: 0,
  maxHeight: isExpanded ? 300 : 30,
  overflowY: isExpanded ? 'auto' : 'hidden',
  transition: 'all 300ms'
}))

interface Props {
  service?: string
  onRemove?: () => void
}
const PokerEstimateHeaderCardError = (props: Props) => {
  const {onRemove, service} = props
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  if (!service || !onRemove) {
    return (
      <HeaderCardWrapper isDesktop={isDesktop}>
        <ErrorCard>
          <CardTitleWrapper>
            <CardTitle>{`That story doesn't exist!`}</CardTitle>
          </CardTitleWrapper>
          <CardDescription isExpanded={false}>
            {`The story was deleted. You can add another story in the Scope phase.`}
          </CardDescription>
        </ErrorCard>
      </HeaderCardWrapper>
    )
  }
  const serviceName = service.charAt(0).toUpperCase() + service.slice(1)
  return (
    <HeaderCardWrapper isDesktop={isDesktop}>
      <HeaderCard>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className='absolute top-2 right-2 cursor-pointer bg-inherit'>
              <DeleteIcon onClick={() => onRemove()} />
            </button>
          </TooltipTrigger>
          <TooltipContent side='bottom' align='center' sideOffset={2} className=''>
            {'Remove from Scope'}
          </TooltipContent>
        </Tooltip>
        <CardTitleWrapper>
          <CardTitle>{`${serviceName} is Down!`}</CardTitle>
        </CardTitleWrapper>
        <CardDescription isExpanded>
          {`Cannot connect to ${serviceName}. Voting will be disabled. If the problem persists, please re-add the issue or re-integrate.`}
        </CardDescription>
      </HeaderCard>
    </HeaderCardWrapper>
  )
}

export default PokerEstimateHeaderCardError
