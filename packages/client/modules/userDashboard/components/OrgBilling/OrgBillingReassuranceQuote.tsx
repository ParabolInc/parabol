import React, {useState} from 'react'
import ian from 'styles/theme/images/ian.png'
import adam from 'styles/theme/images/adam.jpeg'
import cliff from 'styles/theme/images/cliff.jpeg'

import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV2'

const quotes = [
  {
    text: 'Parabol’s software was the key to unlocking performance on our leadership team.',
    picture: ian,
    name: 'Ian Myers',
    title: 'GM of Platform at Quartz'
  },
  {
    text: 'We’re big fans of Parabol. It really helps our retrospectives be more efficient and more effective.',
    picture: cliff,
    name: 'Cliff des Ligneris',
    title: 'Senior Product Manager at Doodle'
  },
  {
    text: 'In 4 weeks we were running like a top: priorities and accountabilities are clear, and frankly, our meetings have been a lot more enjoyable.',
    picture: adam,
    name: 'Adam Pisoni',
    title: 'Founder and CEO at Abl Schools'
  }
]

const Quote = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  lineHeight: '20px'
})

const Text = styled('div')({
  fontStyle: 'italic',
  maxWidth: 280
})

const Signature = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const Picture = styled('img')({
  height: 48,
  width: 48,
  borderRadius: '100%'
})

const NameAndTitle = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16
})

const Name = styled('div')({
  lineHeight: '24px',
  fontWeight: 600
})

const Title = styled('div')({
  color: PALETTE.TEXT_LIGHT,
  fontSize: 13
})

interface Props {
  className?: string
}

const OrgBillingReassuranceQuote = (props: Props) => {
  const {className} = props
  const [quoteNumber] = useState(() => Math.floor(Math.random() * quotes.length))
  const {text, picture, name, title} = quotes[quoteNumber]
  return (
    <Quote className={className}>
      <Text>“{text}”</Text>
      <Signature>
        <Picture src={picture}/>
        <NameAndTitle>
          <Name>{name}</Name>
          <Title>{title}</Title>
        </NameAndTitle>
      </Signature>
    </Quote>
  )
}

export default OrgBillingReassuranceQuote
