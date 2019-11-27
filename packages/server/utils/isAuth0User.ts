const isAuth0User = (userId: string) => !userId.startsWith('sso|') && !userId.startsWith('local|')

export default isAuth0User
