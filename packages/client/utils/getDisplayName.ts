const getDisplayName = (WrappedComponent: React.ComponentType<any>) =>
  WrappedComponent.displayName || WrappedComponent.name || 'Component'
export default getDisplayName
