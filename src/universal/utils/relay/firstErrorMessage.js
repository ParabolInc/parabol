const firstErrorMessage = (errors) => (errors && errors[0] && errors[0].message) || undefined

export default firstErrorMessage
