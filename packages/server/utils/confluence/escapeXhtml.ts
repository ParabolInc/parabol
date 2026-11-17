export const escapeCdata = (text: string) => text.replaceAll(']]>', ']]]]><![CDATA[>')
