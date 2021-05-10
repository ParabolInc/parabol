// import {withKnobs} from '@storybook/addon-knobs'
// import {storiesOf} from '@storybook/react'
// import React from 'react'
// import ReflectTemplateModal from '../modules/meeting/components/ReflectTemplateModal'
// import StoryProvider from './components/StoryProvider'
// import {PALETTE} from '../styles/paletteV3'

// const retroMeetingSettings = {
//   reflectTemplates: [
//     {
//       id: '1',
//       name: 'Standard',
//       prompts: [
//         {
//           id: '1-0',
//           question: 'good',
//           groupColor: PALETTE.PROMPT_GREEN,
//           sortOrder: 0
//         },
//         {
//           id: '1-1',
//           question: 'bad',
//           groupColor: PALETTE.PROMPT_RED,
//           sortOrder: 1
//         }
//       ]
//     },
//     {
//       id: '2',
//       name: 'Different',
//       prompts: [
//         {
//           id: '2-0',
//           question: 'wonky',
//           groupColor: PALETTE.PROMPT_ORANGE,
//           sortOrder: 0
//         },
//         {
//           id: '2-1',
//           question: 'weird',
//           groupColor: PALETTE.PROMPT_VIOLET,
//           sortOrder: 1
//         }
//       ]
//     }
//   ],
//   selectedTemplateId: '1'
// }

// storiesOf('ReflectTemplateModal', module)
//   .addDecorator(withKnobs)
//   .add('base', () => (
//     <StoryProvider>
//       <ReflectTemplateModal retroMeetingSettings={retroMeetingSettings as any} />
//     </StoryProvider>
//   ))
