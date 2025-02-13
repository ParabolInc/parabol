import {generateJSON} from '@tiptap/core'
import {DragReflectionDropTargetTypeEnum} from '~/__generated__/EndDraggingReflectionMutation.graphql'
import {RetroDemo} from '~/types/constEnums'
import {serverTipTapExtensions} from '../../shared/tiptap/serverTipTapExtensions'
import {demoTeamId} from './initDB'

// 3 -> 1
// 4 -> 1
// 5 -> 8
// 7 -> 8

const locationInfo = {
  clientHeight: window.innerHeight,
  clientWidth: window.innerWidth,
  clientX: 1,
  clientY: 1,
  teamId: demoTeamId
}

const initBotScript = () => {
  return {
    reflectStage: [
      {
        op: 'EditReflectionMutation',
        delay: 1000,
        botId: 'bot1',
        variables: {
          promptId: 'startId',
          isEditing: true
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 300,
        botId: 'bot2',
        variables: {
          promptId: 'startId',
          isEditing: true
        }
      },
      {
        op: 'CreateReflectionMutation',
        delay: 2000,
        botId: 'bot1',
        variables: {
          input: {
            id: 'botRef1',
            groupId: 'botGroup1',
            content: JSON.stringify(
              generateJSON(
                `<p>I'd like to give our interns and junior staff more space to share their ideas & fresh thinking</p>`,
                serverTipTapExtensions
              )
            ),
            promptId: 'startId',
            sortOrder: 0
          }
        }
      },
      {
        op: 'CreateReflectionMutation',
        delay: 1000,
        botId: 'bot2',
        variables: {
          input: {
            id: 'botRef2',
            groupId: 'botGroup2',
            content: JSON.stringify(
              generateJSON(`<p>Writing down our processes</p>`, serverTipTapExtensions)
            ),
            promptId: 'startId',
            sortOrder: 0
          }
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 3000,
        botId: 'bot1',
        variables: {
          promptId: 'startId',
          isEditing: false
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 500,
        botId: 'bot1',
        variables: {
          promptId: 'stopId',
          isEditing: true
        }
      },
      {
        op: 'CreateReflectionMutation',
        delay: 2000,
        botId: 'bot1',
        variables: {
          input: {
            id: 'botRef3',
            groupId: 'botGroup3',
            content: JSON.stringify(
              generateJSON(
                `<p>Some people always take all the air time. It's hard to get my ideas on the floor</p>`,
                serverTipTapExtensions
              )
            ),
            promptId: 'stopId',
            sortOrder: 1
          }
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 1000,
        botId: 'bot2',
        variables: {
          promptId: 'startId',
          isEditing: false
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 500,
        botId: 'bot2',
        variables: {
          promptId: 'stopId',
          isEditing: true
        }
      },
      {
        op: 'CreateReflectionMutation',
        delay: 2000,
        botId: 'bot2',
        variables: {
          input: {
            id: 'botRef4',
            groupId: 'botGroup4',
            content: JSON.stringify(
              generateJSON(`<p>Making important decisions in chat</p>`, serverTipTapExtensions)
            ),
            promptId: 'stopId',
            sortOrder: 1
          }
        }
      },
      {
        op: 'CreateReflectionMutation',
        delay: 2000,
        botId: 'bot1',
        variables: {
          input: {
            id: 'botRef5',
            groupId: 'botGroup5',
            content: JSON.stringify(
              generateJSON(
                `<p>Having debates that go nowhere over group chat</p>`,
                serverTipTapExtensions
              )
            ),
            promptId: 'stopId',
            sortOrder: 2
          }
        }
      },
      {
        op: 'CreateReflectionMutation',
        delay: 2000,
        botId: 'bot2',
        variables: {
          input: {
            id: 'botRef6',
            groupId: 'botGroup6',
            content: JSON.stringify(
              generateJSON(`<p>Having so many meetings</p>`, serverTipTapExtensions)
            ),
            promptId: 'stopId',
            sortOrder: 2
          }
        }
      },
      {
        op: 'CreateReflectionMutation',
        delay: 2000,
        botId: 'bot1',
        variables: {
          input: {
            id: 'botRef7',
            groupId: 'botGroup7',
            content: JSON.stringify(
              generateJSON(
                `<p>Prioritizing so much work every sprint, we can't get it all done!</p>`,
                serverTipTapExtensions
              )
            ),
            promptId: 'stopId',
            sortOrder: 2
          }
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 1000,
        botId: 'bot2',
        variables: {
          promptId: 'stopId',
          isEditing: false
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 500,
        botId: 'bot2',
        variables: {
          promptId: 'continueId',
          isEditing: true
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 5000,
        botId: 'bot1',
        variables: {
          promptId: 'stopId',
          isEditing: false
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 2000,
        botId: 'bot1',
        variables: {
          promptId: 'continueId',
          isEditing: true
        }
      },
      {
        op: 'CreateReflectionMutation',
        delay: 2000,
        botId: 'bot1',
        variables: {
          input: {
            id: 'botRef8',
            groupId: 'botGroup8',
            content: JSON.stringify(
              generateJSON(`<p>Team retreats every quarter</p>`, serverTipTapExtensions)
            ),
            promptId: 'continueId',
            sortOrder: 3
          }
        }
      },
      {
        op: 'FlagReadyToAdvanceMutation',
        delay: 500,
        botId: 'bot1',
        variables: {
          stageId: RetroDemo.REFLECT_STAGE_ID,
          isReady: true
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 2000,
        botId: 'bot1',
        variables: {
          promptId: 'continueId',
          isEditing: false
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 2000,
        botId: 'bot2',
        variables: {
          promptId: 'continueId',
          isEditing: false
        }
      },
      {
        op: 'FlagReadyToAdvanceMutation',
        delay: 1,
        botId: 'bot2',
        variables: {
          stageId: RetroDemo.REFLECT_STAGE_ID,
          isReady: true
        }
      }
    ],
    groupStage: [
      {
        op: 'StartDraggingReflectionMutation',
        delay: 1500,
        botId: 'bot1',
        variables: {
          dragId: 'botDrag1',
          reflectionId: 'botRef3'
        }
      },
      {
        op: 'UpdateDragLocationMutation',
        delay: 300,
        botId: 'bot1',
        variables: {
          input: {
            ...locationInfo,
            id: 'botDrag1',
            sourceId: 'botRef3',
            targetId: 'botGroup3',
            targetOffsetX: 10,
            targetOffsetY: 10
          }
        }
      },
      {
        op: 'UpdateDragLocationMutation',
        delay: 300,
        botId: 'bot1',
        variables: {
          input: {
            ...locationInfo,
            id: 'botDrag1',
            sourceId: 'botRef3',
            targetId: 'botGroup1',
            targetOffsetX: 100,
            targetOffsetY: 40
          }
        }
      },
      {
        op: 'UpdateDragLocationMutation',
        delay: 300,
        botId: 'bot1',
        variables: {
          input: {
            ...locationInfo,
            id: 'botDrag1',
            sourceId: 'botRef3',
            targetId: 'botGroup1',
            targetOffsetX: 0,
            targetOffsetY: 0
          }
        }
      },
      {
        op: 'EndDraggingReflectionMutation',
        delay: 1000,
        botId: 'bot1',
        variables: {
          reflectionId: 'botRef3',
          dropTargetType: 'REFLECTION_GROUP' as DragReflectionDropTargetTypeEnum,
          dropTargetId: 'botGroup1',
          dragId: 'botDrag1'
        }
      },
      {
        op: 'StartDraggingReflectionMutation',
        delay: 2500,
        botId: 'bot2',
        variables: {
          dragId: 'botDrag2',
          reflectionId: 'botRef4'
        }
      },
      {
        op: 'UpdateDragLocationMutation',
        delay: 300,
        botId: 'bot2',
        variables: {
          input: {
            ...locationInfo,
            id: 'botDrag2',
            sourceId: 'botRef4',
            targetId: 'botGroup4',
            targetOffsetX: -10,
            targetOffsetY: 10
          }
        }
      },
      {
        op: 'UpdateDragLocationMutation',
        delay: 1000,
        botId: 'bot2',
        variables: {
          input: {
            ...locationInfo,
            id: 'botDrag2',
            sourceId: 'botRef4',
            targetId: 'botGroup1',
            targetOffsetX: 200,
            targetOffsetY: 0
          }
        }
      },
      {
        op: 'UpdateDragLocationMutation',
        delay: 1000,
        botId: 'bot2',
        variables: {
          input: {
            ...locationInfo,
            id: 'botDrag2',
            sourceId: 'botRef4',
            targetId: 'botGroup1',
            targetOffsetX: -1,
            targetOffsetY: -10
          }
        }
      },
      {
        op: 'EndDraggingReflectionMutation',
        delay: 800,
        botId: 'bot2',
        variables: {
          reflectionId: 'botRef4',
          dropTargetType: 'REFLECTION_GROUP' as DragReflectionDropTargetTypeEnum,
          dropTargetId: 'botGroup1',
          dragId: 'botDrag2'
        }
      },
      {
        op: 'StartDraggingReflectionMutation',
        delay: 2500,
        botId: 'bot1',
        variables: {
          dragId: 'botDrag3',
          reflectionId: 'botRef7'
        }
      },
      {
        op: 'UpdateDragLocationMutation',
        delay: 700,
        botId: 'bot1',
        variables: {
          input: {
            ...locationInfo,
            id: 'botDrag3',
            sourceId: 'botRef7',
            targetId: 'botGroup7',
            targetOffsetX: -10,
            targetOffsetY: -10
          }
        }
      },
      {
        op: 'UpdateDragLocationMutation',
        delay: 700,
        botId: 'bot1',
        variables: {
          input: {
            ...locationInfo,
            id: 'botDrag3',
            sourceId: 'botRef7',
            targetId: 'botGroup8',
            targetOffsetX: 0,
            targetOffsetY: 100
          }
        }
      },
      {
        op: 'UpdateDragLocationMutation',
        delay: 700,
        botId: 'bot1',
        variables: {
          input: {
            ...locationInfo,
            id: 'botDrag3',
            sourceId: 'botRef7',
            targetId: 'botGroup8',
            targetOffsetX: 0,
            targetOffsetY: 0
          }
        }
      },
      {
        op: 'EndDraggingReflectionMutation',
        delay: 500,
        botId: 'bot1',
        variables: {
          reflectionId: 'botRef7',
          dropTargetType: 'REFLECTION_GROUP' as DragReflectionDropTargetTypeEnum,
          dropTargetId: 'botGroup8',
          dragId: 'botDrag3'
        }
      },
      {
        op: 'StartDraggingReflectionMutation',
        delay: 2500,
        botId: 'bot2',
        variables: {
          dragId: 'botDrag4',
          reflectionId: 'botRef5'
        }
      },
      {
        op: 'UpdateDragLocationMutation',
        delay: 700,
        botId: 'bot2',
        variables: {
          input: {
            ...locationInfo,
            id: 'botDrag4',
            sourceId: 'botRef5',
            targetId: 'botGroup5',
            targetOffsetX: -10,
            targetOffsetY: -10
          }
        }
      },
      {
        op: 'UpdateDragLocationMutation',
        delay: 700,
        botId: 'bot2',
        variables: {
          input: {
            ...locationInfo,
            id: 'botDrag4',
            sourceId: 'botRef5',
            targetId: 'botGroup8',
            targetOffsetX: 0,
            targetOffsetY: 100
          }
        }
      },
      {
        op: 'FlagReadyToAdvanceMutation',
        delay: 1,
        botId: 'bot1',
        variables: {
          stageId: RetroDemo.GROUP_STAGE_ID,
          isReady: true
        }
      },
      {
        op: 'UpdateDragLocationMutation',
        delay: 700,
        botId: 'bot2',
        variables: {
          input: {
            ...locationInfo,
            id: 'botDrag4',
            sourceId: 'botRef5',
            targetId: 'botGroup8',
            targetOffsetX: 0,
            targetOffsetY: 0
          }
        }
      },
      {
        op: 'EndDraggingReflectionMutation',
        delay: 500,
        botId: 'bot2',
        variables: {
          reflectionId: 'botRef5',
          dropTargetType: 'REFLECTION_GROUP' as DragReflectionDropTargetTypeEnum,
          dropTargetId: 'botGroup8',
          dragId: 'botDrag4'
        }
      },
      // dummy op to make the user wait until dragging is complete
      {
        op: 'UpdateDragLocationMutation',
        delay: 1500,
        botId: 'bot1',
        variables: {
          input: {
            ...locationInfo,
            id: 'botDrag3',
            sourceId: 'botRef3',
            targetId: 'botGroup1',
            targetOffsetX: 10,
            targetOffsetY: 20
          }
        }
      },
      {
        op: 'FlagReadyToAdvanceMutation',
        delay: 1,
        botId: 'bot2',
        variables: {
          stageId: RetroDemo.GROUP_STAGE_ID,
          isReady: true
        }
      }
    ],
    voteStage: [
      {
        op: 'VoteForReflectionGroupMutation',
        delay: 1000,
        botId: 'bot1',
        variables: {
          isUnvote: false,
          reflectionGroupId: 'botGroup1'
        }
      },
      {
        op: 'VoteForReflectionGroupMutation',
        delay: 100,
        botId: 'bot1',
        variables: {
          isUnvote: false,
          reflectionGroupId: 'botGroup1'
        }
      },
      {
        op: 'VoteForReflectionGroupMutation',
        delay: 100,
        botId: 'bot1',
        variables: {
          isUnvote: false,
          reflectionGroupId: 'botGroup1'
        }
      },
      {
        op: 'VoteForReflectionGroupMutation',
        delay: 1000,
        botId: 'bot1',
        variables: {
          isUnvote: false,
          reflectionGroupId: 'botGroup2'
        }
      },
      {
        op: 'VoteForReflectionGroupMutation',
        delay: 1000,
        botId: 'bot1',
        variables: {
          isUnvote: false,
          reflectionGroupId: 'botGroup2'
        }
      },
      {
        op: 'VoteForReflectionGroupMutation',
        delay: 100,
        botId: 'bot2',
        variables: {
          isUnvote: false,
          reflectionGroupId: 'botGroup6'
        }
      },
      {
        op: 'VoteForReflectionGroupMutation',
        delay: 100,
        botId: 'bot2',
        variables: {
          isUnvote: false,
          reflectionGroupId: 'botGroup6'
        }
      },
      {
        op: 'VoteForReflectionGroupMutation',
        delay: 100,
        botId: 'bot2',
        variables: {
          isUnvote: false,
          reflectionGroupId: 'botGroup6'
        }
      },
      {
        op: 'FlagReadyToAdvanceMutation',
        delay: 1,
        botId: 'bot1',
        variables: {
          stageId: RetroDemo.VOTE_STAGE_ID,
          isReady: true
        }
      },
      {
        op: 'VoteForReflectionGroupMutation',
        delay: 1000,
        botId: 'bot2',
        variables: {
          isUnvote: false,
          reflectionGroupId: 'botGroup7'
        }
      },
      {
        op: 'FlagReadyToAdvanceMutation',
        delay: 1,
        botId: 'bot2',
        variables: {
          stageId: RetroDemo.VOTE_STAGE_ID,
          isReady: true
        }
      },
      {
        op: 'VoteForReflectionGroupMutation',
        delay: 1000,
        botId: 'bot2',
        variables: {
          isUnvote: false,
          reflectionGroupId: 'botGroup7'
        }
      }
    ]
  }
}

export default initBotScript
