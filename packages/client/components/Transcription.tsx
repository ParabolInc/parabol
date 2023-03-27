import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../styles/paletteV3'

const Wrapper = styled('div')({
  padding: '12px 24px',
  margin: 'auto',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  overflow: 'auto'
})

const Message = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  lineHeight: '20px',
  margin: '24 0'
})

interface Props {
  transcription: string | null
}

const dummyText = `
JS: Good morning everyone. Let's start by reviewing our Q1 financials. MJ, can you walk us through the highlights?

MJ: Sure. Overall, our revenue for the quarter was up 15% compared to the same period last year, driven by strong sales of our flagship product. However, our expenses were also higher due to increased marketing and R&D spending. As a result, our net income for the quarter was slightly below our forecast.

JS: Thanks, Mary. Tom, can you give us an update on the product roadmap?

TW: Yes. We're on track to release our new product in Q3, as planned. However, we've had some delays in the development of certain features, which may impact our timeline. We're working to mitigate the risks and ensure a successful launch.

JS: Okay, thanks for the update. Sarah, how is our marketing and sales strategy shaping up?

SL: We're seeing good traction with our social media campaigns, and our sales team has been making progress with some key accounts. However, we need to do more to differentiate ourselves from our competitors and drive more inbound leads.

DC: I agree. We should explore some new channels for reaching potential customers, such as podcast sponsorships and influencer partnerships.

JS: Those are some good ideas. Let's put together a plan to execute on them in Q2. Is there anything else we need to cover today?

TW: Yes, I wanted to bring up the issue of capacity constraints in our manufacturing process. We may need to invest in additional equipment to keep up with demand.

JS: Okay, let's schedule a separate meeting to dive into that issue in more detail. Thanks everyone, that's all for today.

JS: Good morning everyone. Let's start by reviewing our Q1 financials. MJ, can you walk us through the highlights?

MJ: Sure. Overall, our revenue for the quarter was up 15% compared to the same period last year, driven by strong sales of our flagship product. However, our expenses were also higher due to increased marketing and R&D spending. As a result, our net income for the quarter was slightly below our forecast.

JS: Thanks, Mary. Tom, can you give us an update on the product roadmap?

TW: Yes. We're on track to release our new product in Q3, as planned. However, we've had some delays in the development of certain features, which may impact our timeline. We're working to mitigate the risks and ensure a successful launch.

JS: Okay, thanks for the update. Sarah, how is our marketing and sales strategy shaping up?

SL: We're seeing good traction with our social media campaigns, and our sales team has been making progress with some key accounts. However, we need to do more to differentiate ourselves from our competitors and drive more inbound leads.

DC: I agree. We should explore some new channels for reaching potential customers, such as podcast sponsorships and influencer partnerships.

JS: Those are some good ideas. Let's put together a plan to execute on them in Q2. Is there anything else we need to cover today?

TW: Yes, I wanted to bring up the issue of capacity constraints in our manufacturing process. We may need to invest in additional equipment to keep up with demand.

JS: Okay, let's schedule a separate meeting to dive into that issue in more detail. Thanks everyone, that's all for today.


`

const Transcription = (props: Props) => {
  const {transcription} = props

  return (
    <Wrapper>
      <Message>{dummyText}</Message>
    </Wrapper>
  )
}

export default Transcription
