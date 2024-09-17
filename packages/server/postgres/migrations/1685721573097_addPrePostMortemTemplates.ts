import {PALETTE} from 'parabol-client/styles/paletteV3'
import {Client} from 'pg'
import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPgConfig from '../getPgConfig'
import getPgp from '../getPgp'

interface Prompt {
  question: string
  description?: string
}

interface Template {
  name: string
  type: 'premortem' | 'postmortem'
  prompts: Prompt[]
}

const NEW_TEMPLATE_CONFIGS: Template[] = [
  {
    name: 'Budget review post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '💰 How did our actual spending compare to the initial budget?',
        description: "Compare your project's financial performance against the planned budget."
      },
      {
        question: '📊 What were the major cost drivers?',
        description: "Identify factors that most impacted your project's financial performance."
      },
      {
        question: '💼 Where can we make adjustments for better budget allocation?',
        description:
          'Determine opportunities to optimize spending and allocate resources more effectively.'
      }
    ]
  },
  {
    name: 'Control range post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '🎛️ What was within our control?',
        description: 'Identify factors your team could influence or manage.'
      },
      {
        question: '🌪️ What was beyond our control?',
        description:
          "Recognize external forces affecting the project but outside your team's influence."
      },
      {
        question: '📈 What can we improve in our control range?',
        description: 'Determine areas within your control to adjust for future projects.'
      }
    ]
  },
  {
    name: 'Process improvement post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '🔄 What processes worked well during the project?',
        description: "Find the successful aspects of your project's workflows and methodologies."
      },
      {
        question: '⚠️ What processes could be improved?',
        description:
          "Pinpoint areas where your project's procedures faced challenges or fell short."
      },
      {
        question: '🔬 What innovations or creative solutions emerged during the project?',
        description: 'Identify any inventive methods or ideas that proved beneficial.'
      },
      {
        question: '📝 How can we optimize our workflows for future projects?',
        description: 'Develop strategies to enhance processes and adopt or update best practices.'
      }
    ]
  },
  {
    name: 'Simple post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '✅ What went well during the project?',
        description: 'Highlight the successful aspects of the project.'
      },
      {
        question: '❌ What could be improved for future projects?',
        description: 'Identify the project’s challenges and issues.'
      },
      {
        question: '📝 What actions can we take to address these improvements?',
        description: 'Outline actions to boost future projects.'
      }
    ]
  },
  {
    name: 'Agile post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '🔄 How well did we adapt and iterate throughout the project?',
        description:
          "Evaluate your team's ability to respond to changes and implement iterations during the project."
      },
      {
        question: '🤝 How effective were our collaboration and communication?',
        description: "Assess your team's quality of teamwork, information sharing, and cooperation."
      },
      {
        question: '🎯 What Agile principles can we improve upon for future projects?',
        description:
          'Find areas where your team can strengthen their application of Agile methodologies.'
      }
    ]
  },
  {
    name: 'Time management post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '⏱️ How accurate were our initial time estimates?',
        description:
          "Gauge the precision of your team's time forecasts and compare them to the actual time invested in project tasks."
      },
      {
        question: '📅 Which tasks took longer than expected, and why?',
        description:
          'Identify tasks that required more time than anticipated and discuss the reasons behind this.'
      },
      {
        question: '🚧 What obstacles impacted our time management?',
        description:
          'Uncover the factors that caused delays or inefficiencies in the project and learn from them.'
      },
      {
        question:
          '⚙️ What strategies can we implement to improve time management in future projects?',
        description:
          "Develop action plans to master time allocation and scheduling, boosting your team's productivity and punctuality."
      }
    ]
  },
  {
    name: 'IT project post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question:
          '💻 Which technology tools and platforms were most beneficial during the project?',
        description: 'Identify the most valuable and effective components of your technology stack.'
      },
      {
        question: '🔧 What gaps or challenges did we face in our IT infrastructure?',
        description: 'Recognize any technology-related issues or shortcomings.'
      },
      {
        question: '📈 How can we enhance our technology stack for future projects?',
        description:
          'Formulate strategies to upgrade your IT infrastructure and tools, considering the insights from this post-mortem.'
      }
    ]
  },
  {
    name: 'Software project post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '👩‍💻 How did our development process perform during the project?',
        description: 'Assess the effectiveness and efficiency of your software development process.'
      },
      {
        question: '🔎 How successful were our testing and quality assurance efforts?',
        description: 'Evaluate the thoroughness and accuracy of your testing and QA processes.'
      },
      {
        question: '🚀 How smoothly did our deployment and maintenance procedures go?',
        description:
          'Review the efficiency and success of your software deployment and maintenance.'
      }
    ]
  },
  {
    name: 'Engineering post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '📐 Did our project design and planning meet expectations?',
        description:
          "Assess how your project's design and planning helped meet your engineering goals."
      },
      {
        question: '🔨 How well did we execute the project and overcome technical challenges?',
        description:
          "Assess your team's ability to manage the project and tackle technical obstacles."
      },
      {
        question: '🤓 What nuggets of wisdom can we mine for future engineering projects?',
        description:
          'Identify best practices, areas for improvement, and other insights to optimize future engineering projects.'
      }
    ]
  },
  {
    name: 'Post-mortem analysis',
    type: 'postmortem',
    prompts: [
      {
        question: "🎯 What were our project's objectives, and did we achieve them?",
        description: 'Re-examine your project goals and evaluate your performance against them.'
      },
      {
        question: '📉 What challenges or obstacles did we face?',
        description: 'Identify the challenges that shaped your project.'
      },
      {
        question: "👍️ What worked well and what didn't?",
        description: 'Highlight successes and areas that need improvement.'
      },
      {
        question: '🗒️ What can we learn and apply to future projects?',
        description: 'Create actionable plans from the insights the other questions revealed.'
      }
    ]
  },
  {
    name: 'Post-incident review',
    type: 'postmortem',
    prompts: [
      {
        question: '🚩 What incidents or issues disrupted our flow?',
        description: 'List the incidents that took place.'
      },
      {
        question: '🌳 What were the root causes and contributing factors?',
        description:
          'Identify the underlying causes and other elements that played a role in the problems you faced.'
      },
      {
        question: '🔍 What can we learn from these incidents?',
        description: 'Reflect on the lessons these incidents provided.'
      },
      {
        question:
          '🛠️ What preventive measures can we put in place for similar incidents in the future?',
        description: 'Develop strategies to minimize recurrence and enhance future responses.'
      }
    ]
  },
  {
    name: 'Incident response post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '⚠️ What was our incident response strategy, and how well did it work?',
        description: "Review your team's actions and decisions in handling incidents."
      },
      {
        question:
          '⛑️ Which aspects of our response were most effective, and which were less successful?',
        description: 'Identify areas where your team excelled and those needing improvement.'
      },
      {
        question: '🚨 Were our incident response plans and procedures effective?',
        description: 'Evaluate the usefulness of existing approaches and protocols.'
      },
      {
        question: '📈 What improvements can we make to our incident response for future projects?',
        description: "Develop strategies to improve your team's incident readiness."
      }
    ]
  },
  {
    name: 'Incident impact post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '🔍 What was the impact of the incident?',
        description:
          'List the incidents that took place during the project and discuss their effects.'
      },
      {
        question: '🌳 What was the root cause?',
        description: 'Identify the underlying causes of each incident.'
      },
      {
        question: '💡 What lessons have we learned from this incident?',
        description: 'Determine the key takeaways from each incident.'
      },
      {
        question: '🔧 What changes can we make to prevent similar incidents in the future?',
        description: 'Create plans to minimize the chances of recurrence.'
      }
    ]
  },
  {
    name: 'Risk management post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '🎲 What risks did we identify, and how did we manage them?',
        description: "Review the identified risks and your team's risk mitigation strategies."
      },
      {
        question: '📊 How effective were our risk management efforts?',
        description: "Assess the success of your team's risk mitigation strategies."
      },
      {
        question: '🚧 What unexpected risks or challenges emerged?',
        description: 'Explore unforeseen risks and their impact on the project.'
      },
      {
        question: '🔮 How can we improve risk management for future projects?',
        description:
          "Define actions and procedures to enhance your team's ability to navigate uncertainties."
      }
    ]
  },
  {
    name: 'Team performance post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '👥 How did our team dynamics impact the project?',
        description: "Assess the effect of your team's interpersonal relationships on the project."
      },
      {
        question: '🗣️ What communication challenges did we face?',
        description: 'Identify any communication issues that arose and their impact on the project.'
      },
      {
        question: '🤝 How can we improve collaboration for future projects?',
        description: 'Determine areas for growth and develop strategies to enhance teamwork.'
      }
    ]
  },
  {
    name: 'Feature launch post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '📣 What feedback did we receive from customers?',
        description: 'Collect and categorize customer feedback from various channels.'
      },
      {
        question: '🎯 What were the most common customer pain points?',
        description: 'Identify recurring issues and areas of dissatisfaction.'
      },
      {
        question: '🏆️ What aspects did customers appreciate the most?',
        description:
          "Highlight the strengths and successful elements of the project from the customers' perspective."
      },
      {
        question: '🔄 What changes can we make based on customer feedback?',
        description:
          'Think of ways to address customer concerns and enhance your products or services.'
      }
    ]
  },
  {
    name: 'Stakeholder satisfaction post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '🤝 How aligned were our project outcomes with stakeholder expectations?',
        description:
          "Assess the alignment between your team's deliverables and stakeholder expectations."
      },
      {
        question: '📣 How effective was our communication with stakeholders?',
        description:
          'Evaluate the clarity, frequency, and impact of your communications with stakeholders.'
      },
      {
        question: '🚩 What challenges did we encounter in managing stakeholder expectations?',
        description:
          'Identify any misunderstandings or disconnects that arose between the team and stakeholders.'
      },
      {
        question: '🎯 What steps can we take to improve stakeholder engagement in future projects?',
        description:
          'Develop approaches to strengthen stakeholder relationships, improve communication, and align project outcomes with stakeholder expectations.'
      }
    ]
  },
  {
    name: 'Blameless post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '📉 What challenges arose during the project?',
        description:
          'Describe the difficulties encountered, focusing on the situation and the impact, not on individuals or their actions.'
      },
      {
        question: '🌱 What can we learn from these situations?',
        description:
          'Reflect on the issues from a blameless perspective, emphasizing the lessons learned rather than assigning fault.'
      },
      {
        question: '🔧 What changes can we make to prevent these issues in the future?',
        description:
          'Suggest improvements or preventive measures, keeping in mind the goal is to improve the process, not to blame people.'
      }
    ]
  },
  {
    name: 'Remote work post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '🌍 What worked well in our remote work environment?',
        description: 'Highlight the positive aspects of your remote work dynamics.'
      },
      {
        question: '📞 Where did our digital communication fall flat?',
        description: 'Identify areas where remote communication could be improved.'
      },
      {
        question: '💻 What specific remote work challenges did we face?',
        description: 'Pinpoint the unique obstacles that emerged due to the distributed work setup.'
      },
      {
        question: '🌐 What steps can we take to make remote work more seamless?',
        description: 'Brainstorm ways to enhance remote collaboration and streamline communication.'
      }
    ]
  },
  {
    name: 'Superhero post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '🦸 What unique superpowers does each team member possess?',
        description: 'Discover the unique talents of each individual.'
      },
      {
        question: '💥 How did these superpowers drive the project forward?',
        description: "Analyze how individual strengths influenced the project's outcome."
      },
      {
        question: '💪 What opportunities lie ahead for each superhero?',
        description: "Discuss ways to further leverage each team member's talents."
      },
      {
        question: '🎯 How can we better align our superpowers with project objectives?',
        description: 'Consider how to match individual strengths with specific project goals.'
      }
    ]
  },
  {
    name: 'Time travel post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '⌛ If we could go back in time, what would we change?',
        description: 'Discuss changes your team would make if given a second chance.'
      },
      {
        question: '🚀 What did we learn for future projects?',
        description:
          'Imagine how the lessons and insights gained from this project will improve future endeavors.'
      },
      {
        question: "🔍 How did this project shape our team's growth and development?",
        description: "Imagine how this project impacts your team's evolution."
      },
      {
        question: '🌈 How will changes we make now improve future projects?',
        description: 'Consider how actions you take now will play out in future projects.'
      }
    ]
  },
  {
    name: 'Movie director post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '🎬 What was the plot of our project movie?',
        description: "Narrate the project's journey, including pivotal events and plot twists."
      },
      {
        question: '🎥 How did each cast member contribute to the plot?',
        description: "Discuss each team member's roles and actions."
      },
      {
        question: '🏔️ What were the climaxes and plot holes in our project movie?',
        description: 'Identify key victories and hurdles.'
      },
      {
        question: '2️⃣ What ingredients do we need for a blockbuster sequel?',
        description: 'Reflect on elements that could make future projects even more successful.'
      }
    ]
  },
  {
    name: 'Game show post-mortem',
    type: 'postmortem',
    prompts: [
      {
        question: '🎮 What were the key "rounds" of our project game show?',
        description: 'Break down the project into distinct stages.'
      },
      {
        question: '🏆 What were the wins and losses during each round?',
        description: 'Identify successes and challenges at each stage.'
      },
      {
        question: "🎉 How did each contestant contribute to the game show's finale?",
        description: "Discuss each individual's roles and actions."
      },
      {
        question: '🕹️ What game rules should we modify for the next season?',
        description: 'Consider changes that could improve the process for future projects.'
      }
    ]
  },
  {
    name: 'Why did the project fail pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '⁉️ Why did the project fail?',
        description:
          'What could go wrong and prevent us meeting our goals? Try to focus on things that could reasonably put the project off track. '
      }
    ]
  },
  {
    name: 'Success and failure pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '🏆 What does success look like?',
        description: 'Envision the end goal and the milestones that mark the path to success.'
      },
      {
        question: '🚧 What does failure look like?',
        description:
          'Consider the potential obstacles and challenges that could derail the project.'
      }
    ]
  },
  {
    name: 'Team efficiency pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '⏳ What slowed us down?',
        description: "Identify processes or factors that could hinder your team's progress."
      },
      {
        question: '🚧 Where could we get stuck?',
        description: 'Anticipate potential bottlenecks or obstacles that may stall the project.'
      },
      {
        question: '🆘 Where might we need extra help?',
        description:
          'Recognize areas where your team may require additional resources or expertise.'
      },
      {
        question: '🎯 What caused us to miss the deadline?',
        description:
          'Envision scenarios that could lead to missed deadlines and develop strategies to avoid them.'
      }
    ]
  },
  {
    name: 'Obstacle course pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '🚧 Hurdles',
        description:
          'What barriers might we encounter that require us to change course or adapt our approach?'
      },
      {
        question: '🕳️ Pitfalls',
        description:
          'What hidden traps or pitfalls could cause setbacks, delays, or negative impacts on the project?'
      },
      {
        question: '🌪️ Twists',
        description:
          'What unexpected changes or surprises might require quick thinking and flexibility?'
      },
      {
        question: '🎽 Teamwork',
        description:
          'How can we best support each other and collaborate to overcome these challenges and reach our goals?'
      }
    ]
  },
  {
    name: 'Timeline pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '📆 Start',
        description:
          'What challenges might we face at the beginning of the project? Consider potential obstacles such as team formation, initial planning, and resource allocation.'
      },
      {
        question: '🕰️ Middle',
        description:
          'What challenges might we face during the middle of the project? Reflect on possible hurdles like shifting deadlines, team fatigue, and evolving priorities.'
      },
      {
        question: '🏁 End',
        description:
          'What challenges might we face at the end of the project? Envision potential difficulties like last-minute changes, finalizing deliverables, and closing the project effectively.'
      }
    ]
  },
  {
    name: 'Resource allocation pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '💼 People',
        description: 'Are we lacking any essential skills or expertise for the project?'
      },
      {
        question: '⏳ Time',
        description:
          'Are there any time constraints or scheduling conflicts that could hinder the project?'
      },
      {
        question: '💰 Budget',
        description:
          'Are there any budget limitations or financial risks that could impact the project?'
      },
      {
        question: '🛠️ Tools',
        description:
          'Are there any gaps in our toolset or technology stack that could impact the project?'
      }
    ]
  },
  {
    name: 'Best/worst case scenario pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '🤦 Worst case scenario',
        description:
          'What does the worst case scenario look like? Consider the most significant setbacks and obstacles your project could face.'
      },
      {
        question: '🙌 Best case scenario',
        description:
          "What does the best case scenario look like? Imagine your project's ultimate success and the milestones that lead to it."
      },
      {
        question: '⛳ Actions',
        description:
          'What actions can we take to transform the worst-case scenario into the best-case scenario? Develop strategic plans and contingencies to turn challenges into opportunities.'
      }
    ]
  },
  {
    name: 'Risks and precautions pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '💥 Risks',
        description: 'What are the biggest risks we could face during the project?'
      },
      {
        question: '⛑️ Precautions',
        description: 'What precautions should we take now to mitigate these risks?'
      }
    ]
  },
  {
    name: 'Blind spot pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '👁️ Visible',
        description: 'What obvious threats should we mitigate?'
      },
      {
        question: '👻 Invisible',
        description: 'What hidden or unknown threats should we pre-empt?'
      }
    ]
  },
  {
    name: 'What if... pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: 'What if [insert risk]',
        description: 'Customize this question to address a specific risk.'
      },
      {
        question: 'What if [insert challenge]',
        description: 'Adapt this question to tackle another unique challenge.'
      },
      {
        question: 'What if [insert concern]',
        description: 'Tailor this question to explore an additional concern.'
      }
    ]
  },
  {
    name: 'Threat level pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '🔴 Severe',
        description:
          'What severe issues could we run into that derail the project? (Requires a separate meeting or review.)'
      },
      {
        question: '🟡 Elevated',
        description:
          'What moderate issues would we run into that delay the project? (Warrants 10-20 minutes of discussion during the pre-mortem.)'
      },
      {
        question: '🟢 Low',
        description:
          'What low-risk issues should we expect? (Max. 5 minutes of discussion during the pre-mortem)'
      }
    ]
  },
  {
    name: 'How likely to fail pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '💯 Highly likely',
        description: 'What issues are we highly likely to face?'
      },
      {
        question: '🤔 Somewhat likely',
        description: 'What issues are we likely to face?'
      },
      {
        question: '🤷 Possible',
        description: 'What issues could we possibly face?'
      }
    ]
  },
  {
    name: 'Excited and worried pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '🤩 What are you excited about?'
      },
      {
        question: '😨 What are you worried about?'
      }
    ]
  },
  {
    name: 'Iguana, Crocodile, Komodo Dragon pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '🦎 Iguana',
        description: 'What minor issues can we quickly and easily resolve now?'
      },
      {
        question: '🐊 Crocodile',
        description: 'What significant and foreseeable threats does this project face?'
      },
      {
        question: '🐉 Komodo Dragon',
        description: 'What big, scary, and unpredictable challenges might we encounter?'
      }
    ]
  },
  {
    name: 'Glass half-empty pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '⏳ Glass half full',
        description: 'What do we expect to go well?'
      },
      {
        question: '⌛ Glass half empty',
        description: 'What do we worry will go wrong?'
      }
    ]
  },
  {
    name: 'Safari pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '🦒 Giraffe',
        description: 'What risks can we see from a long way off and pre-empt now?'
      },
      {
        question: '🐘 Elephant',
        description: 'What concerns you that nobody else is discussing?'
      },
      {
        question: '🐅 Cheetah',
        description: 'What issues are hidden in plain sight, ready to pounce on us?'
      },
      {
        question: '🐒 Monkey',
        description: 'What early warning signs could indicate something is going wrong?'
      }
    ]
  },
  {
    name: 'Mad scientist pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '⚗️ Crazy experiments',
        description: 'What wild and unexpected risks might we face?'
      },
      {
        question: '🧪 Freak accidents',
        description: 'What surprising challenges could throw our project off course?'
      },
      {
        question: '💡 Innovative solutions',
        description: 'How can we invent creative strategies to counter these threats?'
      }
    ]
  },
  {
    name: 'Uncertain waters pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '🌊 Hidden reefs',
        description: 'What unforeseen obstacles or issues could cause us to run aground?'
      },
      {
        question: '🌀 Storms',
        description: 'What significant challenges or crises might we face during the project?'
      },
      {
        question: '⚓ Anchors',
        description: 'What might hold us back, slow our progress, or hinder our efficiency?'
      },
      {
        question: '🏝️ Safe harbors',
        description: 'How can we best prepare to weather these challenges and uncertainties?'
      }
    ]
  },
  {
    name: 'Fortune teller pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '🔮 Crystal ball',
        description: 'What potential issues do we foresee arising during the project?'
      },
      {
        question: '🌟 Stars align',
        description: "How might these issues impact our project's success or failure?"
      },
      {
        question: '✨ Changing fate',
        description:
          'What actions can we take now to alter the course of our project for the better?'
      }
    ]
  },
  {
    name: 'Stakeholder concerns pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '🤵 Executive concerns',
        description: 'What concerns might our executives have about the project?'
      },
      {
        question: '👩‍💼 Team concerns',
        description: 'What concerns might our team members have about the project?'
      },
      {
        question: '🤝 Client concerns',
        description: 'What concerns might our clients have about the project?'
      },
      {
        question: '🌐 Community concerns',
        description: 'What concerns might the broader community have about the project?'
      }
    ]
  },
  {
    name: 'Communication risks pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '📣 Internal communication',
        description: 'What communication issues might arise within the team?'
      },
      {
        question: '💬 External communication',
        description: 'What communication issues might arise with stakeholders or clients?'
      },
      {
        question: '📩 Information flow',
        description:
          'What issues might hinder the flow of information between team members or stakeholders?'
      },
      {
        question: '🤯 Misunderstandings',
        description: 'What potential misunderstandings or misconceptions could cause problems?'
      }
    ]
  },
  {
    name: 'Scrum sprint pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '🎯 Product backlog',
        description: 'What challenges could arise in maintaining a healthy and prioritized backlog?'
      },
      {
        question: '📊 Sprint planning',
        description: 'What obstacles might we face in effectively planning and executing sprints?'
      },
      {
        question: '🔄 Retrospectives',
        description:
          'What challenges could impact the effectiveness of our retrospectives and continuous improvement efforts?'
      },
      {
        question: '🚀 Sprint review',
        description:
          'What issues could affect our ability to showcase our progress to stakeholders?'
      }
    ]
  },
  {
    name: 'Scrum roles pre-mortem',
    type: 'premortem',
    prompts: [
      {
        question: '🏃 Scrum Master',
        description: 'What challenges might the Scrum Master face in facilitating the project?'
      },
      {
        question: '👨‍💻 Developers',
        description: 'What challenges might the developers face in executing the project?'
      },
      {
        question: '📚 Product Owner',
        description:
          'What challenges might the Product Owner face in managing the product backlog and aligning with stakeholders?'
      }
    ]
  }
]

const createdAt = new Date()

const makeId = (name: string, type: 'template' | 'prompt') => {
  // FIXME truncate to 100 characters
  const cleanedName = name
    .replace(/[^0-9a-zA-Z ]/g, '') // remove emojis, apostrophes, and dashes
    .split(' ')
    .map(
      (name, idx) =>
        (idx === 0 ? name.charAt(0).toLowerCase() : name.charAt(0).toUpperCase()) + name.slice(1)
    )
    .join('')
    .trim()
  return `${cleanedName}${type === 'template' ? 'Template' : 'Prompt'}`
}

const getTemplateIllustrationUrl = (filename: string) => {
  const cdnType = process.env.FILE_STORE_PROVIDER
  const partialPath = `Organization/aGhostOrg/${filename}`
  if (cdnType === 'local') {
    return `/self-hosted/${partialPath}`
  } else {
    const {CDN_BASE_URL} = process.env
    if (!CDN_BASE_URL) throw new Error('Missng Env: CDN_BASE_URL')
    const hostPath = CDN_BASE_URL.replace(/^\/+/, '')
    return `https://${hostPath}/store/${partialPath}`
  }
}

const makeTemplate = (template: Template) => ({
  createdAt,
  id: makeId(template.name, 'template'),
  isActive: true,
  name: template.name,
  orgId: 'aGhostOrg',
  scope: 'PUBLIC',
  teamId: 'aGhostTeam',
  type: 'retrospective',
  updatedAt: createdAt,
  isStarter: false,
  isFree: true,
  illustrationUrl: getTemplateIllustrationUrl(
    template.type === 'postmortem' ? 'postMortemTemplate.png' : 'preMortemTemplate.png'
  ),
  mainCategory: template.type,
  lastUsedAt: null,
  parentTemplateId: null
})

const promptColors = [
  PALETTE.JADE_400,
  PALETTE.TOMATO_500,
  PALETTE.GOLD_300,
  PALETTE.LILAC_500,
  PALETTE.SKY_300,
  PALETTE.TERRA_300,
  PALETTE.FUSCIA_400,
  PALETTE.SLATE_700
]

type PromptInfo = {
  question: string
  description?: string
  templateId: string
  sortOrder: number
}

const makePrompt = (promptInfo: PromptInfo, idx: number) => {
  const {question, description, templateId, sortOrder} = promptInfo
  const paletteIdx = idx > promptColors.length - 1 ? idx % promptColors.length : idx
  const groupColor = promptColors[paletteIdx]
  return {
    createdAt,
    description: description ?? '',
    groupColor,
    id: makeId(`${templateId}:${question}`, 'prompt'),
    question,
    sortOrder,
    teamId: 'aGhostTeam',
    templateId,
    updatedAt: createdAt,
    removedAt: null
  }
}

const templates = NEW_TEMPLATE_CONFIGS.map((templateConfig) => makeTemplate(templateConfig))
let colorIndex = 0
const reflectPrompts = NEW_TEMPLATE_CONFIGS.map((templateConfig) => {
  return templateConfig.prompts.map((prompt, idx) => {
    colorIndex++
    return makePrompt(
      {
        question: prompt.question,
        description: prompt.description,
        sortOrder: idx,
        templateId: makeId(templateConfig.name, 'template')
      },
      colorIndex
    )
  })
}).flat()

export async function up() {
  const {pgp, pg} = getPgp()
  const columnSet = new pgp.helpers.ColumnSet(
    [
      'id',
      'createdAt',
      'isActive',
      'name',
      'teamId',
      'updatedAt',
      'scope',
      'orgId',
      'type',
      'illustrationUrl',
      'mainCategory',
      {name: 'isStarter', def: false},
      {name: 'isFree', def: false}
    ],
    {table: 'MeetingTemplate'}
  )
  const insert = pgp.helpers.insert(templates, columnSet)
  await pg.none(insert)
  try {
    await connectRethinkDB()
    await r.table('ReflectPrompt').insert(reflectPrompts).run()
    await r.getPoolMaster()?.drain()
  } catch (e) {
    console.log(e)
  }
}

export async function down() {
  const templateIds = templates.map(({id}) => id)
  const promptIds = reflectPrompts.map(({id}) => id)
  try {
    await connectRethinkDB()
    await r.table('ReflectPrompt').getAll(r.args(promptIds)).delete().run()
    await r.getPoolMaster()?.drain()
  } catch (e) {
    console.log(e)
  }
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DELETE FROM "MeetingTemplate" WHERE id = ANY($1);`, [templateIds])
  await client.end()
}
