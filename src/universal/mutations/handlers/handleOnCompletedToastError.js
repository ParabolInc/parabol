import {showWarning} from 'universal/modules/toast/ducks/toastDuck'

const handleOnCompletedToastError = (error, dispatch) => {
  if (!error) return
  const {message, title} = error
  dispatch(
    showWarning({
      title,
      message,
      action: {
        label: 'OK'
      },
      autoDismiss: 0
    })
  )
}

export default handleOnCompletedToastError
