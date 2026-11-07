// A local, rule-based supportive conversation guide. Not a clinical or AI model.
const themes = [
  {
    id: 'regret',
    patterns: [/\bregret\b/, /\bif only\b/, /\bi (?:messed|screwed) up\b/, /\bmy (?:mistake|fault)\b/, /\bi ruined\b/, /\bi should(?:n'?t| not) have\b/, /\bwish i (?:had|hadn'?t|never)\b/],
    replies: [
      'It sounds like you keep going back over something that happened. We can look at it without deciding it defines you. What part do you most wish you could change?',
      'Regret can make the past feel like it is happening again. What happened, and is there anything you can still put right now?',
      'You may not be able to undo it, but you can decide what comes next. Is the hardest part what happened, how someone was affected, or how you see yourself?',
      'Could we separate what was in your control from what was not? That might help us find one honest next step instead of replaying everything.'
    ],
    followUps: [
      'What would taking responsibility look like here without punishing yourself forever?',
      'Do you need to make something right, or do you mostly need help accepting what you cannot change?',
      'If you could do one small thing differently tomorrow, what would it be?'
    ]
  },
  {
    id: 'shame',
    patterns: [/\bi hate myself\b/, /\bi'?m (?:worthless|useless|disgusting|a failure|a bad person)\b/, /\bi am (?:worthless|useless|disgusting|a failure|a bad person)\b/, /\bshame\b/, /\bashamed\b/, /\bembarrassed\b/, /\bnot good enough\b/, /\bfeel (?:ugly|stupid|worthless)\b/],
    replies: [
      'You are speaking about yourself very harshly. What happened that made you start seeing yourself this way?',
      'That sounds painful to carry. Could we describe what happened without turning it into a judgment about your whole worth?',
      'When shame gets loud, it can make one event feel like your entire identity. What is the thought about yourself that keeps coming back?',
      'You can acknowledge something difficult about yourself without tearing yourself down. What would a fairer description of the situation sound like?'
    ],
    followUps: [
      'Would you speak to someone you care about in the same way you are speaking to yourself?',
      'What evidence supports that harsh thought, and what evidence might it be leaving out?',
      'What do you need right now: some perspective, a way to repair something, or a little relief?'
    ]
  },
  {
    id: 'anxiety',
    patterns: [/\banxious\b/, /\banxiety\b/, /\bpanic\b/, /\bpanicking\b/, /\bworried\b/, /\boverwhelm(?:ed|ing)?\b/, /\bspirall?(?:ing)?\b/, /\boverthink(?:ing)?\b/, /\bscared\b/, /\bnervous\b/, /\bheart (?:is )?racing\b/],
    replies: [
      'That sounds overwhelming. If you can, feel both feet on the floor and slowly breathe out. You do not have to solve everything at once. What is the main thought making you anxious?',
      'Let’s make the next minute smaller. Look around and name a few things you can see. Is the fear about something happening now, or something that might happen?',
      'Your mind may be trying to prepare for every possibility. What is one thing you know for certain about the situation, and one thing you are only imagining?',
      'You sound under a lot of pressure. Would it help to separate the part you can act on today from the part that is outside your control?'
    ],
    followUps: [
      'What is one manageable action you could take in the next ten minutes?',
      'What do you think your mind is trying to protect you from?',
      'Would you rather unpack the thought, or try a grounding exercise first?'
    ]
  },
  {
    id: 'sadness',
    patterns: [/\bdepress(?:ed|ion)\b/, /\bsad\b/, /\bempty\b/, /\bnumb\b/, /\bhopeless\b/, /\bfeel nothing\b/, /\bcrying\b/, /\bno energy\b/, /\bexhausted with life\b/, /\bi can'?t do this anymore\b/],
    replies: [
      'I’m sorry things feel so heavy. You don’t need to explain everything perfectly. What has been the hardest part of today?',
      'That sounds draining. Before trying to make sense of everything, have you had a little water, food, or rest? What is taking the most out of you right now?',
      'When you feel low, even small tasks can feel enormous. Could we focus just on what would make the next hour a little easier?',
      'It sounds like you have been carrying a lot. Is this feeling connected to something that happened, or has it been building for a while?'
    ],
    followUps: [
      'Has there been any moment recently, however small, when things felt a little less heavy?',
      'Would it help to talk about what happened, or find one practical thing to do next?',
      'Is there someone in your life who knows how difficult this has been?'
    ]
  },
  {
    id: 'loneliness',
    patterns: [/\blonely\b/, /\balone\b/, /\bisolat(?:ed|ion)\b/, /\bnobody cares\b/, /\bno one cares\b/, /\bno friends\b/, /\bno one understands\b/, /\bleft out\b/],
    replies: [
      'Feeling disconnected can hurt a lot. Is there someone you miss, or does it feel more like nobody really understands you?',
      'That sounds lonely. You don’t need to suddenly become social to change it. Is there one person you would feel comfortable sending a simple message to?',
      'Sometimes being around people and still feeling alone is the hardest part. When do you notice the loneliness most?',
      'I’m listening. What kind of connection are you missing right now: someone to talk to, someone who understands, or just someone to be around?'
    ],
    followUps: [
      'What has made reaching out difficult lately?',
      'Would one small step toward someone feel possible today?',
      'What would feeling understood actually look like for you?'
    ]
  },
  {
    id: 'relationships',
    patterns: [/\bbreak\s?up\b/, /\bheartbroken\b/, /\bcheat(?:ed|ing)\b/, /\brelationship\b/, /\bex\b/, /\bthey left me\b/, /\bmiss (?:him|her|them)\b/, /\bdivorc(?:e|ed)\b/],
    replies: [
      'Relationships can leave a lot of unanswered questions. What hurts most right now: the loss itself, what happened, or what it makes you think about yourself?',
      'You may be dealing with grief, anger, and confusion at the same time. Which feeling is strongest today?',
      'That sounds difficult. We don’t have to decide what the relationship meant all at once. What happened most recently?',
      'It can help to separate missing someone from deciding what contact is healthy for you. What are you hoping would happen next?'
    ],
    followUps: [
      'What would a boundary that protects your peace look like today?',
      'Is there a question you wish you could ask them, even if you never send it?',
      'What do you need right now: closure, distance, or someone to hear the full story?'
    ]
  },
  {
    id: 'anger',
    patterns: [/\bangry\b/, /\bfurious\b/, /\brage\b/, /\bfrustrat(?:ed|ing)\b/, /\bsnapped\b/, /\bpissed off\b/, /\bi hate everyone\b/],
    replies: [
      'Something has clearly pushed you hard. Before responding to anyone, would you be able to put a little space between yourself and the situation? What happened?',
      'Anger can point to a boundary that matters. Do you feel hurt, ignored, disrespected, or trapped?',
      'You don’t have to act while the feeling is at its strongest. What would you like to be different once things settle?',
      'It makes sense to want the pressure to stop. Would talking through the trigger help before you decide what to do?'
    ],
    followUps: [
      'What can you control in the next few minutes?',
      'Is there a way to express that boundary without hurting yourself or someone else?',
      'What would help you cool down enough to choose your next move?'
    ]
  },
  {
    id: 'stress',
    patterns: [/\bstress(?:ed|ful)?\b/, /\bburn(?:t|ed) out\b/, /\bworkload\b/, /\btoo much\b/, /\bpressure\b/, /\bcan'?t keep up\b/, /\bexhausted\b/, /\bwork\b/, /\bexam(?:s)?\b/],
    replies: [
      'That is a lot to carry. If we put everything on the table, which one thing feels most urgent?',
      'When everything feels important, it can help to choose just one next step. What is the smallest task you could realistically do today?',
      'You sound stretched thin. Are you lacking time, energy, support, or a bit of all three?',
      'It may help to distinguish what truly needs doing from what feels like it needs doing. What can wait?'
    ],
    followUps: [
      'Is there something you could pause, postpone, or ask for help with?',
      'What would a more manageable version of today look like?',
      'Have you been able to rest, or are you pushing through without a break?'
    ]
  },
  {
    id: 'grief',
    patterns: [/\bgrief\b/, /\bgrieving\b/, /\bdied\b/, /\bpassed away\b/, /\blost (?:my|someone)\b/, /\bfuneral\b/, /\bmourning\b/],
    replies: [
      'I’m sorry for your loss. There isn’t a right way to grieve. If you want, tell me a little about the person or what you miss most.',
      'Grief can come in waves, and the unexpected moments are often the hardest. What has this week been like?',
      'That sounds painful. You don’t have to find meaning or look for a positive side right now. What is one thing you wish people understood about your loss?',
      'Missing someone can make ordinary things feel strange. Is there a memory you want to share?'
    ],
    followUps: [
      'Would you rather talk about them, or about how you are coping today?',
      'Is there anything that makes the difficult moments a little easier?',
      'What has changed the most for you since the loss?'
    ]
  },
  {
    id: 'sleep',
    patterns: [/\bcan'?t sleep\b/, /\binsomnia\b/, /\bnightmare(?:s)?\b/, /\bnot sleeping\b/, /\bawake all night\b/, /\bsleep badly\b/],
    replies: [
      'Being awake with difficult thoughts can make them feel louder. Would writing down the thought and setting it aside for tonight help, or is your body feeling too alert to rest?',
      'You don’t have to force sleep. If you can, lower the light and focus on resting your body. What tends to keep you up?',
      'That sounds tiring. Has the sleep problem been happening for a while, or just recently?',
      'If your mind keeps circling one thing, tell me what it is. We can try to break it into something less overwhelming.'
    ],
    followUps: [
      'What time of night is usually hardest?',
      'Would it be useful to unpack the repeating thought before trying to rest?',
      'Have you noticed any pattern in what makes sleep easier or harder?'
    ]
  },
  {
    id: 'future',
    patterns: [/\bmy future\b/, /\bwhat if\b/, /\bafraid of failing\b/, /\bfear of failure\b/, /\bnot sure what to do\b/, /\bdon'?t know what to do\b/, /\blost in life\b/, /\bno direction\b/],
    replies: [
      'Uncertainty can be unsettling. What is the decision or possibility that keeps coming back to you?',
      'You do not need the entire plan today. Could we identify one thing that matters to you and one small action connected to it?',
      'When the future feels unclear, it can help to separate actual choices from predictions. What is one choice you do have?',
      'It sounds like there is a lot of pressure to get this right. What would a good-enough next step look like?'
    ],
    followUps: [
      'What is one possible outcome you fear, and how likely is it really?',
      'Would you rather explore your options or find something you can do today?',
      'Whose expectations are you carrying here: yours or someone else’s?'
    ]
  }
];

function matches(text, expressions) { return expressions.some(expression => expression.test(text)); }
function getTheme(text) { return themes.find(theme => matches(text, theme.patterns)); }

const selfHarm = [
  /\bkill myself\b/, /\b(?:want|wanna|wish|need) to die\b/, /\bsuicid(?:e|al)\b/,
  /\bend my life\b/, /\bend it all\b/, /\bhurt myself\b/, /\bself[ -]?harm\b/,
  /\bno reason to live\b/, /\bshould (?:just )?die\b/, /\bdon'?t want to (?:be alive|live anymore)\b/,
  /\b(?:cut|cutting) myself\b/, /\b(?:overdose|overdosing)\b/
];
const imminent = [
  /\b(?:tonight|right now|in a minute|today)\b/, /\b(?:i have|i made|i've made) a plan\b/,
  /\bgoing to do it\b/, /\b(?:i have|i've got) (?:the )?(?:pills|knife|rope|weapon)\b/,
  /\bcan'?t (?:stay|keep myself) safe\b/, /\babout to\b/, /\bi already (?:took|swallowed)\b/
];
const negation = /\b(?:i (?:don'?t|do not|never) (?:want|plan|intend) to (?:kill myself|die|hurt myself)|i am not suicidal)\b/;
const urgentOther = /\b(?:i took an overdose|i overdosed|i swallowed pills to die|i took too many pills|i swallowed too many tablets|i am bleeding badly|i am about to hurt someone|i will kill someone)\b/;
const dangerWords = /^(?:yes|yeah|yep|i might|not safe|i'?m not safe|i am not safe|i have a plan|probably|maybe|i don'?t know|not sure|no[, ]+(?:i'?m|i am) not safe)\b/;
const safeWords = /^(?:no|nope|i'?m safe|im safe|i am safe|not going to|i won'?t|i wont|i can stay safe)\b/;

export function createSupportResponder() {
  let previousTopic = null;
  let pendingSafety = false;
  let lastVariant = -1;
  let followUpCount = 0;

  function choose(options) {
    if (options.length === 1) return options[0];
    let i = Math.floor(Math.random() * options.length);
    if (i === lastVariant) i = (i + 1) % options.length;
    lastVariant = i;
    return options[i];
  }

  return function respond(input) {
    const text = input.toLowerCase().replace(/[’‘]/g, "'").trim();
    const isRisk = matches(text, selfHarm) && !negation.test(text);

    // This always takes precedence over ordinary conversational matching.
    if (urgentOther.test(text) || (isRisk && matches(text, imminent) && !/\bnot (?:today|tonight|right now)\b/.test(text))) {
      pendingSafety = true;
      previousTopic = 'safety';
      return 'I’m sorry this has reached such a painful point. Please step away from anything you could use to hurt yourself or someone else, and get near another person if you can. If you might act soon or have already hurt yourself, call your local emergency number now (999/112 in the UK), or go to an emergency department. Are you in immediate danger of hurting yourself or anyone else right now?';
    }

    if (pendingSafety) {
      if (/\b(?:not safe|unsafe|can'?t stay safe|cannot stay safe)\b/.test(text) || (dangerWords.test(text) && !/\byes[, ]+i(?: am|'m) safe\b/.test(text))) {
        return 'Thank you for telling me. Please put distance between you and anything dangerous, and call or tell someone nearby: “I’m not safe on my own right now. Please stay with me.” If you might act, call emergency services now (UK 999/112). If you are in the UK or Ireland, Samaritans can also listen on 116 123. Are you with someone who can stay with you?';
      }
      if (safeWords.test(text) || /\b(?:i (?:am|'m) safe|i can stay safe|i won'?t act on it)\b/.test(text)) {
        pendingSafety = false;
        previousTopic = 'sadness';
        return 'I’m glad you can stay safe right now. Let’s focus on what is hurting instead of trying to solve everything at once. What happened today that made things feel this difficult?';
      }
      // A user changing the subject should not get stuck in a safety-question loop.
      pendingSafety = false;
    }

    if (isRisk) {
      pendingSafety = true;
      previousTopic = 'safety';
      return 'I’m sorry you’re hurting this much. You can talk about it here without having to explain everything perfectly. For the next few minutes, could you move away from anything you could use to hurt yourself and sit somewhere safer? Do you think you might act on these thoughts soon?';
    }

    if (/\b(?:kill (?:someone|him|her|them)|hurt (?:someone|him|her|them)|attack someone)\b/.test(text)) {
      previousTopic = 'anger';
      return 'It sounds like your anger is intense. Please step away from that person and anything you could use as a weapon. You do not need to act on this feeling. Are you able to stay away from them while we talk about what happened? If someone is in immediate danger, call emergency services.';
    }

    if (/\b(?:can'?t breathe|cannot breathe|severe chest pain|having a heart attack)\b/.test(text)) {
      return 'I’m sorry you’re dealing with this. Trouble breathing or severe chest pain can need urgent medical attention. Please call your local emergency number now if this is happening to you. If it is anxiety and you can breathe normally, let’s talk about what brought it on.';
    }

    if (/^(hello|hi|hey|yo|good (morning|evening|afternoon))[!. ]*$/.test(text)) {
      previousTopic = null;
      return 'What’s on your mind?';
    }

    if (/\b(?:are you (?:ai|a therapist|real)|what are you|how do you work)\b/.test(text)) {
      return 'I use on-device response patterns, not an AI model or a trained therapist. I can help you reflect on feelings and consider small next steps, but I may misunderstand what you say. What would you like to talk about?';
    }

    const theme = getTheme(text);
    if (theme) {
      const changed = previousTopic !== theme.id;
      previousTopic = theme.id;
      followUpCount = 0;
      if (changed) lastVariant = -1;
      return choose(theme.replies);
    }

    if (previousTopic && previousTopic !== 'safety') {
      const topic = themes.find(item => item.id === previousTopic);
      if (topic && followUpCount < 2) {
        followUpCount++;
        return choose(topic.followUps);
      }
    }

    return choose([
      'What part of that feels hardest for you?',
      'Can you tell me a little more about what happened?',
      'Would you prefer to talk through the feeling, or think about a small next step?',
      'What do you wish someone understood about this?',
      'What do you think you need most right now?'
    ]);
  };
}
