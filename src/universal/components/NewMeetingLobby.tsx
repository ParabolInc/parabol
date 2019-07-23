import styled from '@emotion/styled'
import {minWidthMediaQueries} from 'universal/styles/breakpoints'

const NewMeetingLobby = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexBasis: 'auto',
  flexDirection: 'column',
  flexGrow: 1,
  flexShrink: 0,
  justifyContent: 'center',
  padding: '2rem 4rem',
  textAlign: 'left',
  width: '100%',

  [minWidthMediaQueries[1]]: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },

  [minWidthMediaQueries[2]]: {
    paddingLeft: 72
  },

  [minWidthMediaQueries[3]]: {
    paddingBottom: '3rem',
    paddingTop: '3rem'
  },
  [minWidthMediaQueries[4]]: {
    paddingBottom: '4rem',
    paddingTop: '4rem'
  },
  [minWidthMediaQueries[5]]: {
    paddingBottom: '6rem',
    paddingTop: '6rem'
  }
})

export default NewMeetingLobby
