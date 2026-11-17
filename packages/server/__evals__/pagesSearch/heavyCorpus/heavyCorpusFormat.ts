import type {Random} from './createRandom'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

export const formatMeetingDate = (date: Date) =>
  `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`

export const toIsoDay = (date: Date) => date.toISOString().slice(0, 10)

export const atUtcTime = (date: Date, hours: number, minutes: number) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes))

export const randomUuid = (random: Random) => {
  const hex = Array.from({length: 4}, () =>
    Math.floor(random.next() * 0x100000000)
      .toString(16)
      .padStart(8, '0')
  ).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export const randomId = (random: Random, length = 10) =>
  Array.from({length}, () => random.pick([...ID_ALPHABET])).join('')

export const avatarFor = (name: string) =>
  `https://app.example.com/assets/User/local|${name.toLowerCase().replace(/[^a-z]/g, '')}/picture/avatar.png`

export const firstName = (name: string) => name.split(' ')[0]!

export const fill = (template: string, slots: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (match, slot: string) => slots[slot] ?? match)

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export const plural = (count: number, singular: string, pluralForm = `${singular}s`) =>
  `${count} ${count === 1 ? singular : pluralForm}`
