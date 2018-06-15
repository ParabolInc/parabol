const resetDragContext = (reflectionProxy) => {
  const dragContext = reflectionProxy.getLinkedRecord('dragContext')
  if (dragContext) {
    // relay is weird. i have to null out child linked records, too, otherwise they flash back in
    // dragContext.setValue(null, 'dragCoords')
    // dragContext.setValue(null, 'dragUser')
    // dragContext.setValue(null, 'initialCursorCoords')
    // dragContext.setValue(null, 'initialComponentCoords')
    // dragContext.setValue(null, 'isClosing')
    // dragContext.setValue(null, 'isViewerDragging')
    reflectionProxy.setValue(null, 'dragContext')
  }
}

export default resetDragContext
