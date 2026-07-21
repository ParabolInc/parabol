/**
 * A horizontal separator; looks like:
 *  ---------- some text ----------
 *
 */

import styled from '@emotion/styled'
import {Fragment} from 'react'
import LabelHeading from '../LabelHeading/LabelHeading'

// font size lives in the className below, not here: an Emotion fontSize can't beat
// LabelHeading's own `text-xs`, but tailwind-merge resolves `text-[11px]` against it
const SeparatorContainer = styled(LabelHeading)<{
  margin: string | number | undefined
}>(({margin}) => ({
  display: 'flex',
  margin,
  maxWidth: '100%',
  padding: '16px 0',
  width: '100%'
}))

const separatorLineStyles = {
  borderBottom: `1px solid var(--color-hairline)`,
  flex: 1,
  margin: 'auto'
}

const LeftSeparator = styled('div')({
  ...separatorLineStyles,
  marginRight: 8
})

const RightSeparator = styled('div')({
  ...separatorLineStyles,
  marginLeft: 8
})

const FullSeparator = styled('div')({
  ...separatorLineStyles,
  flex: 1
})

interface Props {
  margin?: string
  text?: string
}

// leading-4 is restated alongside text-[11px] because tailwind-merge treats font-size as
// conflicting with leading (a `text-*` may carry its own), so it drops LabelHeading's
export default ({margin, text}: Props) => (
  <SeparatorContainer className='text-[11px] leading-4' margin={margin}>
    {text ? (
      <Fragment>
        <LeftSeparator />
        {text}
        <RightSeparator />
      </Fragment>
    ) : (
      <FullSeparator />
    )}
  </SeparatorContainer>
)
