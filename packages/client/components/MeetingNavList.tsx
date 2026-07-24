import styled from '@emotion/styled'

const MeetingNavList = styled('ul')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  listStyle: 'none',
  margin: 0,
  minHeight: 0, // very important! allows children to collapse for overflow
  // px-3 to match the dashboard left nav horizontal inset
  padding: '0 12px',
  overflow: 'auto'
})

export default MeetingNavList
