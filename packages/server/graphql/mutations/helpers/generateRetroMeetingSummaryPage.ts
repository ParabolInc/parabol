import dayjs from 'dayjs'
import {quickHash} from '../../../../client/shared/utils/quickHash'
import makeAppURL from '../../../../client/utils/makeAppURL'
import plural from '../../../../client/utils/plural'
import appOrigin from '../../../appOrigin'
import type {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
export const generateRetroMeetingSummaryPage = async (
  meetingId: string,
  dataLoader: DataLoaderInstance
) => {
  const [meeting, meetingMembers] = await Promise.all([
    dataLoader.get('newMeetings').loadNonNull(meetingId),
    dataLoader.get('meetingMembersByMeetingId').load(meetingId)
  ])
  const {
    name: meetingName,
    endedAt,
    teamId,
    createdAt,
    topicCount,
    taskCount,
    reflectionCount
  } = meeting
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const {name: teamName} = team
  const startTime = dayjs(createdAt)
  const endTime = dayjs(endedAt)
  const startLabel = startTime.format('MMM D, YYYY')
  const endLabel = endTime.format('MMM D, YYYY')
  const teamHomeURL = makeAppURL(appOrigin, `team/${teamId}`)
  const durationLabel =
    startLabel === endLabel ? startLabel : `${startTime.format('MMM D')} - ${endLabel}`
  const topicLabel = plural(topicCount || 0, 'Topic')
  const taskLabel = plural(taskCount || 0, 'New Task')
  const reflectionLabel = plural(reflectionCount || 0, 'Reflection')
  const participantLabel = plural(meetingMembers.length, 'Participant')
  const startTimeRange = startTime.subtract(1, 'hour').toISOString()
  const endTimeRange = endTime.add(1, 'hour').toISOString()
  const insightsPrompt = `You are an expert in agile retrospectives and project management.
Your team has just completed a retrospective and it is your job to generate insights from the data and report to senior management.
Senior management wants to know where to best focus their time, so be concise and focus on next steps to take.
If there is not enough data to generate insightful findings, respond with "Not enough data to generate insights.".
It should include at most 3 topics that are the most important highlights, takeaways, or areas that may need their attention.
The format:
- (gold emoji) bold text as highlight: expanded explanation and/or suggested action
- (silver emoji) bold text as highlight: expanded explanation and/or suggested action
- (copper emoji) bold text as highlight: expanded explanation and/or suggested action
`
  const insightsHash = await quickHash([...meetingId, insightsPrompt])
  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: {level: 1},
        content: [{type: 'text', text: `${meetingName} - ${endLabel}`}]
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: teamName,
            marks: [
              {
                type: 'link',
                attrs: {
                  href: teamHomeURL,
                  target: '_blank',
                  rel: 'noopener noreferrer nofollow',
                  class: 'link'
                }
              },
              {type: 'bold', attrs: {}}
            ]
          },
          {
            type: 'text',
            text: ` — ${durationLabel}`,
            marks: [{type: 'bold', attrs: {}}]
          }
        ]
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: `${topicLabel} - ${taskLabel} - ${reflectionLabel} - ${participantLabel}`
          }
        ]
      },
      {type: 'paragraph'},
      {
        type: 'insightsBlock',
        attrs: {
          id: crypto.randomUUID(),
          editing: false,
          teamIds: [teamId],
          meetingTypes: ['retrospective'],
          after: startTimeRange,
          before: endTimeRange,
          meetingIds: [meetingId],
          title: 'Top 3 Topics',
          hash: insightsHash,
          prompt: insightsPrompt
        },
        content: [
          {
            type: 'heading',
            attrs: {level: 2},
            content: [{type: 'text', text: 'Top 3 Takeaways'}]
          },
          {
            type: 'paragraph',
            content: [
              {type: 'text', text: '🥇 '},
              {
                type: 'text',
                text: 'Demo and Advocate Conversion',
                marks: [{type: 'bold', attrs: {}}]
              },
              {
                type: 'text',
                text: ': There’s a strong call for more active demos and deep-dive discussions on converting potential detractors into advocates. Consider prioritizing targeted demos and gathering qualitative feedback from established customers to refine the product’s positioning. '
              }
            ]
          },
          {
            type: 'paragraph',
            content: [
              {type: 'text', text: '🥈 '},
              {
                type: 'text',
                text: 'Financial Stability Check',
                marks: [{type: 'bold', attrs: {}}]
              },
              {
                type: 'text',
                text: ': Concerns have been raised regarding company financial status following setbacks like the phase III DoD contract. It would be beneficial to get an updated financial overview and communicate any potential impacts, including layoffs, to ensure team confidence.'
              }
            ]
          },
          {
            type: 'paragraph',
            content: [
              {type: 'text', text: '🥉 '},
              {
                type: 'text',
                text: 'Marketing Strategy and Performance',
                marks: [{type: 'bold', attrs: {}}]
              },
              {
                type: 'text',
                text: ': Questions about the current marketing strategy, especially regarding website sign-ups and meeting targets, suggest a need for increased visibility and regular updates on performance metrics. Explore setting up a weekly dashboard on Slack for better transparency and quick adjustments.'
              }
            ]
          }
        ]
      },
      {type: 'heading', attrs: {level: 2}, content: [{type: 'text', text: '3 Tasks'}]},
      {
        type: 'heading',
        attrs: {level: 3},
        content: [
          {type: 'text', text: '(1) Terry re: ', marks: [{type: 'bold', attrs: {}}]},
          {
            type: 'text',
            text: 'Demo and Advocate Conversion',
            marks: [
              {
                type: 'link',
                attrs: {
                  href: 'https://action.parabol.co/meet/H2feA3owPS/discuss/1',
                  target: '_blank',
                  rel: 'noopener noreferrer nofollow',
                  class: 'link'
                }
              },
              {type: 'bold', attrs: {}}
            ]
          }
        ]
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'This is the task 1 verbatim. This is the task 1 verbatim. This is the task 1 verbatim.'
          }
        ]
      },
      {
        type: 'heading',
        attrs: {level: 3},
        content: [
          {type: 'text', text: '(2) Terry re: ', marks: [{type: 'bold', attrs: {}}]},
          {
            type: 'text',
            text: 'Demo and Advocate Conversion',
            marks: [
              {
                type: 'link',
                attrs: {
                  href: 'https://action.parabol.co/meet/H2feA3owPS/discuss/1',
                  target: '_blank',
                  rel: 'noopener noreferrer nofollow',
                  class: 'link'
                }
              },
              {type: 'bold', attrs: {}}
            ]
          }
        ]
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'This is the task 1 verbatim. This is the task 1 verbatim. This is the task 1 verbatim.'
          }
        ]
      },
      {
        type: 'heading',
        attrs: {level: 3},
        content: [
          {type: 'text', text: '(3) Terry re: ', marks: [{type: 'bold', attrs: {}}]},
          {
            type: 'text',
            text: 'Demo and Advocate Conversion',
            marks: [
              {
                type: 'link',
                attrs: {
                  href: 'https://action.parabol.co/meet/H2feA3owPS/discuss/1',
                  target: '_blank',
                  rel: 'noopener noreferrer nofollow',
                  class: 'link'
                }
              },
              {type: 'bold', attrs: {}}
            ]
          }
        ]
      },
      {
        type: 'heading',
        attrs: {level: 3},
        content: [{type: 'text', text: 'Task title verbatim'}]
      },
      {
        type: 'paragraph',
        content: [{type: 'text', text: 'This is the task 1 verbatim. This is the task 1 verbatim.'}]
      },
      {
        type: 'imageBlock',
        attrs: {
          src: 'https://media.tenor.com/CypRS6CS1OwAAAAm/guatemala-soccer-players-doing-brazilian-dance-on-pexico.webp',
          height: 88,
          width: 153,
          align: 'left'
        }
      },
      {
        type: 'paragraph',
        content: [{type: 'text', text: 'This is the task 1 verbatim. This is the task 1 verbatim.'}]
      },
      {type: 'heading', attrs: {level: 2}, content: [{type: 'text', text: '10 Topics'}]},
      {
        type: 'bulletList',
        attrs: {tight: true},
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Demo and Advocate Conversion',
                    marks: [
                      {
                        type: 'link',
                        attrs: {
                          href: 'https://action.parabol.co/meet/H2feA3owPS/discuss/1',
                          target: '_blank',
                          rel: 'noopener noreferrer nofollow',
                          class: 'link'
                        }
                      },
                      {type: 'bold', attrs: {}}
                    ]
                  },
                  {type: 'hardBreak'},
                  {type: 'text', text: '10 Votes, 3 Tasks, 4 Comments, 5 Reflections'}
                ]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Demo and Advocate Conversion',
                    marks: [
                      {
                        type: 'link',
                        attrs: {
                          href: 'https://action.parabol.co/meet/H2feA3owPS/discuss/1',
                          target: '_blank',
                          rel: 'noopener noreferrer nofollow',
                          class: 'link'
                        }
                      },
                      {type: 'bold', attrs: {}}
                    ]
                  },
                  {type: 'hardBreak'},
                  {type: 'text', text: '10 Votes, 3 Tasks, 4 Comments, 5 Reflections'}
                ]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Demo and Advocate Conversion',
                    marks: [
                      {
                        type: 'link',
                        attrs: {
                          href: 'https://action.parabol.co/meet/H2feA3owPS/discuss/1',
                          target: '_blank',
                          rel: 'noopener noreferrer nofollow',
                          class: 'link'
                        }
                      },
                      {type: 'bold', attrs: {}}
                    ]
                  },
                  {type: 'hardBreak'},
                  {type: 'text', text: '10 Votes, 3 Tasks, 4 Comments, 5 Reflections'}
                ]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Demo and Advocate Conversion',
                    marks: [
                      {
                        type: 'link',
                        attrs: {
                          href: 'https://action.parabol.co/meet/H2feA3owPS/discuss/1',
                          target: '_blank',
                          rel: 'noopener noreferrer nofollow',
                          class: 'link'
                        }
                      },
                      {type: 'bold', attrs: {}}
                    ]
                  },
                  {type: 'hardBreak'},
                  {type: 'text', text: '10 Votes, 3 Tasks, 4 Comments, 5 Reflections'}
                ]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Demo and Advocate Conversion',
                    marks: [
                      {
                        type: 'link',
                        attrs: {
                          href: 'https://action.parabol.co/meet/H2feA3owPS/discuss/1',
                          target: '_blank',
                          rel: 'noopener noreferrer nofollow',
                          class: 'link'
                        }
                      },
                      {type: 'bold', attrs: {}}
                    ]
                  },
                  {type: 'hardBreak'},
                  {type: 'text', text: '10 Votes, 3 Tasks, 4 Comments, 5 Reflections'}
                ]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Demo and Advocate Conversion',
                    marks: [
                      {
                        type: 'link',
                        attrs: {
                          href: 'https://action.parabol.co/meet/H2feA3owPS/discuss/1',
                          target: '_blank',
                          rel: 'noopener noreferrer nofollow',
                          class: 'link'
                        }
                      },
                      {type: 'bold', attrs: {}}
                    ]
                  },
                  {type: 'hardBreak'},
                  {type: 'text', text: '10 Votes, 3 Tasks, 4 Comments, 5 Reflections'}
                ]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Demo and Advocate Conversion',
                    marks: [
                      {
                        type: 'link',
                        attrs: {
                          href: 'https://action.parabol.co/meet/H2feA3owPS/discuss/1',
                          target: '_blank',
                          rel: 'noopener noreferrer nofollow',
                          class: 'link'
                        }
                      },
                      {type: 'bold', attrs: {}}
                    ]
                  },
                  {type: 'hardBreak'},
                  {type: 'text', text: '10 Votes, 3 Tasks, 4 Comments, 5 Reflections'}
                ]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Demo and Advocate Conversion',
                    marks: [
                      {
                        type: 'link',
                        attrs: {
                          href: 'https://action.parabol.co/meet/H2feA3owPS/discuss/1',
                          target: '_blank',
                          rel: 'noopener noreferrer nofollow',
                          class: 'link'
                        }
                      },
                      {type: 'bold', attrs: {}}
                    ]
                  },
                  {type: 'hardBreak'},
                  {type: 'text', text: '10 Votes, 3 Tasks, 4 Comments, 5 Reflections'}
                ]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Demo and Advocate Conversion',
                    marks: [
                      {
                        type: 'link',
                        attrs: {
                          href: 'https://action.parabol.co/meet/H2feA3owPS/discuss/1',
                          target: '_blank',
                          rel: 'noopener noreferrer nofollow',
                          class: 'link'
                        }
                      },
                      {type: 'bold', attrs: {}}
                    ]
                  },
                  {type: 'hardBreak'},
                  {type: 'text', text: '10 Votes, 3 Tasks, 4 Comments, 5 Reflections'}
                ]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Demo and Advocate Conversion',
                    marks: [
                      {
                        type: 'link',
                        attrs: {
                          href: 'https://action.parabol.co/meet/H2feA3owPS/discuss/1',
                          target: '_blank',
                          rel: 'noopener noreferrer nofollow',
                          class: 'link'
                        }
                      },
                      {type: 'bold', attrs: {}}
                    ]
                  },
                  {type: 'hardBreak'},
                  {type: 'text', text: '10 Votes, 3 Tasks, 4 Comments, 5 Reflections'}
                ]
              }
            ]
          }
        ]
      },
      {
        type: 'heading',
        attrs: {level: 2},
        content: [{type: 'text', text: '7 Participants'}]
      },
      {
        type: 'bulletList',
        attrs: {tight: true},
        content: [
          {
            type: 'listItem',
            content: [{type: 'paragraph', content: [{type: 'text', text: 'Bruce Tian'}]}]
          },
          {
            type: 'listItem',
            content: [{type: 'paragraph', content: [{type: 'text', text: 'Drew'}]}]
          },
          {
            type: 'listItem',
            content: [{type: 'paragraph', content: [{type: 'text', text: 'Grayson Crickman'}]}]
          },
          {
            type: 'listItem',
            content: [{type: 'paragraph', content: [{type: 'text', text: 'Jordan'}]}]
          },
          {
            type: 'listItem',
            content: [{type: 'paragraph', content: [{type: 'text', text: 'Kendra Dixon'}]}]
          },
          {
            type: 'listItem',
            content: [{type: 'paragraph', content: [{type: 'text', text: 'matt 🙈 '}]}]
          }
        ]
      }
    ]
  }
}
