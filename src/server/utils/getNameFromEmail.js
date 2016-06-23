export default function getNameFromEmail(email) {
  return email.substring(0, email.lastIndexOf('@'));
}
