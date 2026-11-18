import graphql from 'babel-plugin-relay/macro'

// updateMeetingTemplate is deprecated in favor of setMeetingSettings. Older clients still call it,
// so the meeting subscription keeps reading its payload
graphql`
  fragment useUpdateMeetingTemplateMutation_meeting on UpdateMeetingTemplatePayload {
    meeting {
      ... on RetrospectiveMeeting {
        id
        templateId
        template {
          id
          name
        }
        meetingSeries {
          id
          templateId
          template {
            id
            name
          }
        }
        phases {
          id
          ... on ReflectPhase {
            reflectPrompts {
              ...PhaseItemColumn_prompt @relay(mask: false)
              ...GroupingKanbanColumn_prompt @relay(mask: false)
              id
              sortOrder
            }
          }
        }
      }
      ... on TeamPromptMeeting {
        id
        meetingSeries {
          id
          templateId
        }
        ...TeamPromptStructuredMeeting_meeting
      }
    }
  }
`
