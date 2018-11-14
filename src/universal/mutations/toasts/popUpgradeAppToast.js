const popUpgradeAppToast = ({atmosphere}) => {
  atmosphere.eventEmitter.emit('addToast', {
    title: 'New stuff!',
    message: 'A new version of Parabol is available',
    autoDismiss: 0,
    action: {
      label: 'Refresh to upgrade',
      callback: () => {
        window.location.reload()
      }
    }
  })
}

export default popUpgradeAppToast
