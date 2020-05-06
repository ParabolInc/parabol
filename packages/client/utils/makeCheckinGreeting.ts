const greetings = [
  {
    content: 'Hola',
    language: 'Spanish'
  },
  {
    content: 'Bonjour',
    language: 'French'
  },
  {
    content: 'Guten tag',
    language: 'German'
  },
  {
    content: 'Ciao',
    language: 'Italian'
  },
  {
    content: 'Jambo',
    language: 'Swahili'
  },
  {
    content: 'Oi',
    language: 'Portuguese'
  },
  {
    content: 'Salut',
    language: 'Catalan'
  },
  {
    content: 'Hallo',
    language: 'German'
  },
  {
    content: 'Hej',
    language: 'Swedish'
  },
  {
    content: 'Nǐ hǎo',
    language: 'Chinese'
  },
  {
    content: 'Yeoboseyo',
    language: 'Korean'
  },
  {
    content: 'Shalom',
    language: 'Hebrew'
  },
  {
    content: 'Merhaba',
    language: 'Turkish'
  },
  {
    content: 'Zdravo',
    language: 'Slovenian'
  },
  {
    content: 'Barev',
    language: 'Armenian'
  },
  {
    content: 'Bună',
    language: 'Romanian'
  },
  {
    content: 'Yasou',
    language: 'Greek'
  },
  {
    content: 'Lei Ho',
    language: 'Cantonese'
  }
]

// The trailing question mark “?” is added in the presentation component.
const questions = [
  "If you had to describe how you're feeling right now as a weather pattern, what's your forecast?",
  'What’s something you’re looking forward to, and why?',
  'What’s something you’re worried about?',
  'What’s something new or interesting you’ve learned recently?',
  'What animal best represents you today, and why?',
  'What’s the weirdest thing in your fridge right now?',
  'What was your favorite recent meal, and why?',
  'If you could have one superpower today, what would it be, and for what purpose?',
  'What are you grateful for today, and why?',
  'What would you do if you had an extra day off tomorrow?',
  'If you could invite anyone to dinner tonight, who would it be and what would you eat?',
  'What was the last song you listened to, and where?',
  'What’s your favorite recent accomplishment, and why?',
  'If you could get advice from anyone in the world today, whom would you ask, and what?',
  'If you had an expert personal assistant today, what would you have them do?',
  'What’s something about the next teammate that you appreciate?',
  'Show us something in your space that you really like!',
  'What’s got your attention today, and why?',
  'What was your favorite recent book or article, and what did it inspire?',
  'What emoji best represents you today, and why?',
  'What’s the most important thing to remember daily that you haven’t been able to?',
  'What help could you most use that you haven’t asked for?',
  'What is your one piece of advice to everyone here?',
  'Who was the last person you felt inspired by?',
  'What simple thing still blows your mind?',
  'What sparked your curiosity in whatever you’re most curious about now?',
  'If you could know the absolute and total truth to one question, what question would you ask?',
  'Which question can you ask to find out the most about a person?',
  'What color best describes your personality today?',
  'What’s something new you’ve learned about yourself in the last three months?',
  'Have you been pleasantly surprised by anything recently?',
  'If you did not have to sleep, how would you spend the extra 8 hours?',
  'What thing from nature, excluding animals, best describes you today?',
  'If you could do something that you don’t do because it’s bad for you, but you could do it without any repercussions — what would you do?',
  'What question do you wish people would ask you?',
  'If you could be one other person, who would that person be and why?',
  "If you had to describe how you're feeling right now as an amusement park ride, what ride are you on?",
  'If you could safely eat any inedible object, what would it be?',
  'What are you reading right now?',
  'If you could pick up a new skill in an instant what would it be?',
  'Is there any topic lately that you would like to be mentored on?',
  'Are there any aspects of your personality which hold you back? How do you adapt?',
  'What’s one project that you could stop doing to give yourself more focus?',
  'When you’re feeling stressed, how do you deal with it?',
  'How would you describe your communication style in 3 words?',
  'What criteria helps you decide whether to say “no” to something or commit to it?',
  'What are you excited about this week? What worries you?',
  'What’s one rule your parents or guardians enforced when you were a kid?',
  'Do you have any routines you use to improve your energy and focus?',
  'How do you recognize when you’re stressed?',
  'Who has made a positive difference in your life recently?'
]

export const makeCheckinGreeting = (meetingCount, seedId = '') => {
  const seed = seedId.charCodeAt(0)
  const idx = (seed + meetingCount) % greetings.length
  return greetings[idx]
}

export const makeCheckinQuestion = (meetingCount, seedId = '') => {
  const seed = seedId.charCodeAt(0)
  const idx = (seed + meetingCount) % questions.length
  return questions[idx]
}
