import styled from '@emotion/styled'
import React from 'react'
import {Link} from 'react-router-dom'

const Root = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%'
})

import logoMarkPurple from '../styles/theme/images/brand/mark-color.svg'

interface Props {
  meeting: any
}

const TeamPromptMeeting = (_props: Props) => {
  return (
    <Root>
      <Link title='My Dashboard' to='/meetings'>
        <img alt='Parabol' src={logoMarkPurple} />
      </Link>
    </Root>
  )
}

export default TeamPromptMeeting
