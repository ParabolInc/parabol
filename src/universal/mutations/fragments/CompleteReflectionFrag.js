graphql`
  fragment CompleteReflectionFrag on RetroReflection {
    id
    content
    editorIds
    isViewerCreator
    meetingId
    reflectionGroupId
    retroPhaseItemId
    sortOrder
    phaseItem {
      title
      question
    }
  }
`;
