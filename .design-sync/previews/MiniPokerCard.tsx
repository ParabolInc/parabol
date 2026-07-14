import {MiniPokerCard} from 'parabol-client'

export const Values = () => (
  <div className='flex gap-2'>
    <MiniPokerCard>1</MiniPokerCard>
    <MiniPokerCard>2</MiniPokerCard>
    <MiniPokerCard>3</MiniPokerCard>
    <MiniPokerCard>5</MiniPokerCard>
    <MiniPokerCard>8</MiniPokerCard>
    <MiniPokerCard>13</MiniPokerCard>
  </div>
)

export const FinalScores = () => (
  <div className='flex gap-2'>
    <MiniPokerCard color='#4C9EE7'>1</MiniPokerCard>
    <MiniPokerCard color='#7C6BD6'>3</MiniPokerCard>
    <MiniPokerCard color='#5CB88B'>5</MiniPokerCard>
    <MiniPokerCard color='#E39A3B'>8</MiniPokerCard>
    <MiniPokerCard color='#E0567F'>13</MiniPokerCard>
  </div>
)

export const FinalOutline = () => (
  <div className='flex gap-2'>
    <MiniPokerCard>?</MiniPokerCard>
    <MiniPokerCard isFinal>3</MiniPokerCard>
    <MiniPokerCard isFinal>5</MiniPokerCard>
    <MiniPokerCard isFinal>8</MiniPokerCard>
  </div>
)
