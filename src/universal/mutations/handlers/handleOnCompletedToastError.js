const handleOnCompletedToastError = (error, atmosphere) => {
  if (!error) return
  const {message, title} = error
  atmosphere.eventEmitter.emit('addToast', {
    level: 'warning',
    title,
    message,
    action: {
      label: 'OK'
    },
    autoDismiss: 0
  })
}

export default handleOnCompletedToastError
