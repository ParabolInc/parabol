const isAuth0User = (userId: string) => !userId.startsWith('sso|')

export default isAuth0User
