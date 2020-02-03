import {DragReflectionDropTargetTypeEnum} from '../../types/graphql'
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
          phaseItemId: 'startId',
          isEditing: true
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 300,
        botId: 'bot2',
        variables: {
          phaseItemId: 'startId',
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
            content: `{"blocks":[{"key":"2t965","text":"I'd like to give our interns and junior staff more space to share their ideas & fresh thinking","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
            retroPhaseItemId: 'startId',
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
            content: `{"blocks":[{"key":"2t966","text":"Writing down our processes","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
            retroPhaseItemId: 'startId',
            sortOrder: 0
          }
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 3000,
        botId: 'bot1',
        variables: {
          phaseItemId: 'startId',
          isEditing: false
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 500,
        botId: 'bot1',
        variables: {
          phaseItemId: 'stopId',
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
            content: `{"blocks":[{"key":"2t967","text":"Some people always take all the air time. It's hard to get my ideas on the floor","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
            retroPhaseItemId: 'stopId',
            sortOrder: 1
          }
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 1000,
        botId: 'bot2',
        variables: {
          phaseItemId: 'startId',
          isEditing: false
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 500,
        botId: 'bot2',
        variables: {
          phaseItemId: 'stopId',
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
            content: `{"blocks":[{"key":"2t968","text":"Making important decisions in chat","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
            retroPhaseItemId: 'stopId',
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
            content: `{"blocks":[{"key":"2t969","text":"Having debates that go nowhere over group chat","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
            retroPhaseItemId: 'stopId',
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
            content: `{"blocks":[{"key":"2t970","text":"Having so many meetings","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
            retroPhaseItemId: 'stopId',
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
            content: `{"blocks":[{"key":"2t971","text":" Prioritizing so much work every sprint, we can't get it all done!","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
            retroPhaseItemId: 'stopId',
            sortOrder: 2
          }
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 1000,
        botId: 'bot2',
        variables: {
          phaseItemId: 'stopId',
          isEditing: false
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 500,
        botId: 'bot2',
        variables: {
          phaseItemId: 'continueId',
          isEditing: true
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 5000,
        botId: 'bot1',
        variables: {
          phaseItemId: 'stopId',
          isEditing: false
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 2000,
        botId: 'bot1',
        variables: {
          phaseItemId: 'continueId',
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
            content: `{"blocks":[{"key":"2t971","text":"Team retreats every quarter","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
            retroPhaseItemId: 'continueId',
            sortOrder: 3
          }
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 2000,
        botId: 'bot1',
        variables: {
          phaseItemId: 'continueId',
          isEditing: false
        }
      },
      {
        op: 'EditReflectionMutation',
        delay: 2000,
        botId: 'bot2',
        variables: {
          phaseItemId: 'continueId',
          isEditing: false
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
          dropTargetType: DragReflectionDropTargetTypeEnum.REFLECTION_GROUP,
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
          dropTargetType: DragReflectionDropTargetTypeEnum.REFLECTION_GROUP,
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
          dropTargetType: DragReflectionDropTargetTypeEnum.REFLECTION_GROUP,
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
          dropTargetType: DragReflectionDropTargetTypeEnum.REFLECTION_GROUP,
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
        op: 'VoteForReflectionGroupMutation',
        delay: 1000,
        botId: 'bot2',
        variables: {
          isUnvote: false,
          reflectionGroupId: 'botGroup7'
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
