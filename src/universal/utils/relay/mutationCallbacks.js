export function clearError() {
  if (this.state.error) {
    this.setState({
      error: null
    });
  }
}

export function setError(error) {
  this.setState({
    error
  });
}
