const isAuth0User = (userId: string) => !userId.startsWith('sso|') && !userId.startsWith('u_')

export default isAuth0User
