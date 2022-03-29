import React from 'react'

const JiraServerSVG = React.memo(() => {
  return (
    <svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M26.9143 15.337L16.5718 4.99448L15.5773 4L7.82044 11.7569L4.27348 15.3039C3.90884 15.6685 3.90884 16.2652 4.27348 16.663L11.3674 23.7569L15.5773 28L23.3342 20.2431L23.4668 20.1105L26.9143 16.663C27.279 16.2983 27.279 15.7017 26.9143 15.337ZM15.5773 19.547L12.0304 16L15.5773 12.453L19.1243 16L15.5773 19.547Z'
        fill='#2684FF'
      />
      <path
        d='M15.5774 12.4531C13.257 10.1327 13.257 6.35365 15.5443 4.0332L7.78735 11.7901L11.9973 16.0001L15.5774 12.4531Z'
        fill='url(#paint0_linear)'
      />
      <path
        d='M19.1244 16L15.5774 19.547C17.8978 21.8674 17.8978 25.6464 15.5774 28L23.3674 20.2099L19.1244 16Z'
        fill='url(#paint1_linear)'
      />
      <defs>
        <linearGradient
          id='paint0_linear'
          x1='14.9447'
          y1='8.85952'
          x2='9.99111'
          y2='13.8131'
          gradientUnits='userSpaceOnUse'
        >
          <stop offset='0.176' stopColor='#0052CC' />
          <stop offset='1' stopColor='#2684FF' />
        </linearGradient>
        <linearGradient
          id='paint1_linear'
          x1='16.2558'
          y1='23.0892'
          x2='21.1995'
          y2='18.1456'
          gradientUnits='userSpaceOnUse'
        >
          <stop offset='0.176' stopColor='#0052CC' />
          <stop offset='1' stopColor='#2684FF' />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default JiraServerSVG
