
export default function ({
  id,
  email,
  name,
  nickname,
  picture = null,
} = {}) {
  const now = new Date();

  return {
    id,
    auth0UserInfo: {
      email,
      email_verified: false,
      name,
      nickname,
      picture,
      user_id: id,
      created_at: now,
      updated_at: now
    }
  };
}
