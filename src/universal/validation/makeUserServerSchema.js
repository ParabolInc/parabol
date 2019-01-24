import legitify from './legitify'

export default function makeUserServerSchema () {
  return legitify({
    picture: (value) => value,
    preferredName: (value) =>
      value
        .trim()
        .min(2, 'C’mon, you call that a name?')
        .max(100, 'I want your name, not your life story')
  })
}
