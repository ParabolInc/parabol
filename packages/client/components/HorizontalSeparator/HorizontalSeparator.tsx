/**
 * A horizontal separator; looks like:
 *  ---------- some text ----------
 *
 */

import {Fragment} from 'react'
import LabelHeading from '../LabelHeading/LabelHeading'

interface Props {
  margin?: string
  text?: string
}

export default ({margin, text}: Props) => (
  <LabelHeading className='flex w-full max-w-full py-4 text-[11px] leading-4' style={{margin}}>
    {text ? (
      <Fragment>
        <div className='m-auto mr-2 flex-1 border-hairline border-b' />
        {text}
        <div className='m-auto ml-2 flex-1 border-hairline border-b' />
      </Fragment>
    ) : (
      <div className='m-auto flex-1 border-hairline border-b' />
    )}
  </LabelHeading>
)
