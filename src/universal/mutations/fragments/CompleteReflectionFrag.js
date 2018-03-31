graphql`
  fragment CompleteReflectionFrag on RetroReflection {
    id
    content
    editorIds
    isViewerCreator
    meetingId
    retroPhaseItemId
    sortOrder
    phaseItem {
      question
    }
  }
`;
