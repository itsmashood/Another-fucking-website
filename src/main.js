import './style.css';
import {startScene} from './scene.js';

const animate = startScene();
const $ = selector => document.querySelector(selector);

const storageKey = 'talktome-support-chat';
let conversation = [];
let listening = false;

function status(text = '') {
  const node = $('#status');
  node.textContent = text;
  node.hidden = !text;
}

function saveConversation() {
  localStorage.setItem(storageKey, JSON.stringify(conversation));
}

function bubble(text, role, persist = true) {
  const el = document.createElement('div');
  el.className = 'bubble ' + role;
  el.textContent = text;
  $('#conversation').append(el);
  el.scrollIntoView({ block: 'nearest' });

  if (persist) {
    conversation.push({ role, text, created_at: new Date().toISOString() });
    saveConversation();
  }
}

function renderConversation() {
  $('#conversation').replaceChildren();
  for (const item of conversation) bubble(item.text, item.role, false);
}

function loadConversation() {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) || '[]');
    conversation = Array.isArray(raw)
      ? raw.filter(item => item && typeof item.text === 'string' && ['user', 'assistant'].includes(item.role))
      : [];
    renderConversation();
  } catch {
    conversation = [];
    status('Could not load previous chat history.');
  }
}

function panel(title) {
  $('#panel-content').replaceChildren();
  const h = document.createElement('h2');
  h.textContent = title;
  $('#panel-content').append(h);
  if (!$('#panel').open) $('#panel').showModal();
  return $('#panel-content');
}

function paragraph(parent, text) {
  const p = document.createElement('p');
  p.textContent = text;
  parent.append(p);
}

function button(parent, text, action) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = text;
  b.onclick = action;
  parent.append(b);
  return b;
}

function exportBackup() {
  const data = JSON.stringify(conversation, null, 2);
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'talktome-backup.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showBackups() {
  const p = panel('Backups');
  paragraph(p, 'Chat history is stored in this browser.');
  button(p, 'Export backup', exportBackup);

  const file = document.createElement('input');
  file.type = 'file';
  file.accept = '.json,application/json';
  file.hidden = true;
  p.append(file);

  button(p, 'Import backup', () => file.click());
  button(p, 'Clear chat', () => {
    conversation = [];
    saveConversation();
    renderConversation();
    status('Chat cleared.');
    $('#panel').close();
  });

  file.onchange = async () => {
    try {
      if (!file.files[0]) return;
      const incoming = JSON.parse(await file.files[0].text());
      if (!Array.isArray(incoming)) throw new Error('Invalid backup file.');
      conversation = incoming.filter(item => item && typeof item.text === 'string' && ['user', 'assistant'].includes(item.role));
      saveConversation();
      renderConversation();
      status('Backup imported.');
      $('#panel').close();
    } catch {
      status('Could not import that backup.');
    }
  };
}

$('#account').onclick = showBackups;
$('#close').onclick = () => $('#panel').close();

function randomOf(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function includesAny(text, phrases) {
  return phrases.some(phrase => text.includes(phrase));
}

const crisisPhrases = [
  'kill myself', 'end my life', 'want to die', 'suicide', 'suicidal', 'self harm', 'self-harm',
  'hurt myself', 'don\'t want to live', 'dont want to live', 'no reason to live', 'end it all',
  'i should die', 'i want to disappear forever', 'i might do it'
];

const urgentRiskPhrases = [
  'tonight', 'right now', 'today', 'can\'t stay safe', 'cant stay safe', 'going to do it', 'have a plan',
  'i have pills', 'i have a knife', 'goodbye everyone'
];

const anxietyPhrases = [
  'anxious', 'anxiety', 'panic', 'panicking', 'overwhelmed', 'freaking out', 'can\'t breathe', 'cant breathe',
  'heart racing', 'spiralling', 'spiraling'
];

const regretPhrases = [
  'regret', 'regrets', 'i messed up', 'i ruined', 'my fault', 'wish i never', 'shouldn\'t have', 'shouldnt have',
  'if only', 'i screwed up', 'i made a mistake'
];

const shamePhrases = [
  'ashamed', 'shame', 'embarrassed', 'i hate myself', 'i am disgusting', 'i am awful', 'i am a bad person',
  'worthless', 'useless', 'i am nothing', 'i\'m nothing'
];

const sadnessPhrases = [
  'depressed', 'hopeless', 'empty', 'numb', 'sad', 'tired of everything', 'can\'t do this', 'cant do this',
  'no energy', 'feel nothing'
];

const lonelyPhrases = [
  'alone', 'lonely', 'nobody cares', 'no one cares', 'isolated', 'no friends', 'no one understands'
];

const angerPhrases = [
  'angry', 'rage', 'furious', 'mad', 'snapped', 'lost it', 'hate everyone'
];

const sleepPhrases = [
  'can\'t sleep', 'cant sleep', 'insomnia', 'no sleep', 'sleeping badly', 'nightmares'
];

const breakupPhrases = [
  'breakup', 'break up', 'left me', 'heartbroken', 'miss them', 'cheated on me', 'relationship ended'
];

const crisisReplies = [
  'I\'m really glad you said that here. If you might act on these thoughts or you don\'t feel safe, call emergency services now or go to the nearest emergency department. If you can, message or call one trusted person and ask them to stay with you. If you\'re in the UK or ROI, Samaritans are available on 116 123. If you\'re elsewhere, contact your local crisis line or emergency number right now.',
  'This sounds urgent. Your safety matters more than anything else right now. Please put some distance between yourself and anything you could use to hurt yourself, call emergency services or go to the nearest emergency department, and tell one trusted person exactly what is happening. If you\'re in the UK or ROI, you can call Samaritans on 116 123.',
  'I\'m taking this seriously. Please reach out for immediate human support now: call emergency services, go to the nearest emergency department, or contact a crisis line. If possible, stay with another person and do not stay alone with these thoughts.'
];

const anxietyReplies = [
  'Let\'s slow it down for a moment. Can you place both feet on the floor and take one slow breath in for 4, hold for 4, and out for 6? Then name 5 things you can see and 3 things you can feel. You do not need to solve everything this minute.',
  'It sounds like your system is overloaded. Try this first: unclench your jaw, drop your shoulders, and breathe out longer than you breathe in. Then tell me: is this fear about something happening right now, or about what might happen next?',
  'When anxiety spikes, smaller steps help. Take one sip of water, look around the room, and pick one object to focus on for 10 seconds. After that, tell me the main thought repeating in your head.'
];

const regretReplies = [
  'Regret can be heavy, but it can also point to what matters to you. What happened, what part was in your control, and what is one repair step you could take now?',
  'You may have made a mistake, but that is not the same as being beyond repair. Try separating the event from your identity. What do you wish you had done differently, and what is one honest next step?',
  'When regret loops, it helps to move from replaying to responding. What is the smallest useful action here: apologise, clarify, accept the loss, or make a different choice next time?'
];

const shameReplies = [
  'I\'m hearing a lot of self-judgment. What you did or what happened may need attention, but attacking yourself usually makes it harder to change. What would you say to someone else you cared about if they told you this?',
  'You sound like you\'re hurting and turning that hurt inward. Try naming the fact of what happened without adding a verdict about your whole worth. Then tell me what part feels hardest to forgive.',
  'Shame often says “I am the problem.” A more useful question is: what happened, what need was underneath it, and what could care or accountability look like from here?'
];

const sadnessReplies = [
  'I\'m sorry it feels this heavy. You do not have to fix your whole life tonight. What is one very small thing your body might need right now: water, food, a shower, rest, or texting someone?',
  'When everything feels flat or hopeless, shrinking the time frame can help. Can we focus only on the next 10 minutes? What would make the next 10 minutes slightly safer or easier?',
  'That sounds exhausting. If words are hard, answer with just one thing: what feels heaviest right now — your thoughts, your body, another person, or the future?'
];

const lonelyReplies = [
  'Feeling alone can distort everything. Is there one person you could message with something simple like “I\'m having a rough time and could use some company”? You do not need the perfect words.',
  'Loneliness hurts because connection matters. Let\'s make it practical: who is the safest person to contact today, even if it\'s just to say hello or ask to sit with them?',
  'Being alone with painful thoughts can make them louder. If reaching out feels hard, start small: send one text, join one shared space, or sit somewhere other people are around. Which feels most possible?'
];

const angerReplies = [
  'Anger usually has something underneath it. Before acting on it, can you pause for 60 seconds, breathe out slowly, and tell me whether underneath the anger is hurt, fear, shame, or feeling ignored?',
  'If you feel close to snapping, create a short gap first: step away, put the phone down, or leave the room for a minute. What triggered this most strongly?',
  'Anger can push for immediate action, but not every action helps. What outcome do you want here: to be heard, to protect yourself, to set a limit, or just to release pressure safely?'
];

const sleepReplies = [
  'If sleep is not coming, try not to turn the whole night into a fight. Dim the screen, lower stimulation, and focus on rest rather than forcing sleep. What is keeping you awake most: thoughts, stress, or your body?',
  'Sometimes it helps to empty the mind a little. Write down the thought you keep circling, then tell yourself you can return to it tomorrow. If your body feels wired, try a slower exhale for a minute.',
  'A gentle reset can help more than battling the clock. Put the phone down for a few minutes, loosen your body, and focus on one calm repetitive thing like breathing or noticing sounds around you.'
];

const breakupReplies = [
  'Heartbreak can make everything feel personal and permanent. What hurts most right now: missing them, what happened, or what you are telling yourself this means about you?',
  'After a breakup, people often swing between replaying the past and fearing the future. For this moment, can we focus only on today? What would support look like for the next few hours?',
  'Missing someone does not mean going back is the right answer, and being left does not reduce your worth. What do you need most right now: comfort, clarity, or distance?'
];

const defaultReplies = [
  'I\'m here with you. What feels most important to say about this?',
  'Tell me a little more. What part of this is weighing on you most?',
  'That sounds difficult. What has this been like for you today?',
  'We can take this one step at a time. What feels hardest right now?'
];

function reply(message) {
  const text = message.toLowerCase().trim();

  if (includesAny(text, crisisPhrases)) {
    const urgent = includesAny(text, urgentRiskPhrases);
    return urgent ? crisisReplies[0] : randomOf(crisisReplies);
  }
  if (includesAny(text, anxietyPhrases)) return randomOf(anxietyReplies);
  if (includesAny(text, regretPhrases)) return randomOf(regretReplies);
  if (includesAny(text, shamePhrases)) return randomOf(shameReplies);
  if (includesAny(text, sadnessPhrases)) return randomOf(sadnessReplies);
  if (includesAny(text, lonelyPhrases)) return randomOf(lonelyReplies);
  if (includesAny(text, angerPhrases)) return randomOf(angerReplies);
  if (includesAny(text, sleepPhrases)) return randomOf(sleepReplies);
  if (includesAny(text, breakupPhrases)) return randomOf(breakupReplies);
  if (/^(hi|hello|hey|yo)[!. ]*$/i.test(message)) return 'What\'s on your mind?';

  return randomOf(defaultReplies);
}

$('#chat').onsubmit = event => {
  event.preventDefault();
  const text = $('#message').value.trim();
  if (!text) return;

  $('#message').value = '';
  bubble(text, 'user');

  const answer = reply(text);
  bubble(answer, 'assistant');
  status('');
};

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (Recognition) {
  const recognition = new Recognition();
  recognition.lang = 'en-GB';
  recognition.interimResults = false;

  recognition.onstart = () => {
    listening = true;
    animate(true);
    $('#mic').setAttribute('aria-label', 'Stop voice input');
    status('Listening...');
  };

  recognition.onresult = event => {
    $('#message').value = event.results[0][0].transcript;
    status('');
  };

  recognition.onend = () => {
    listening = false;
    animate(false);
    $('#mic').setAttribute('aria-label', 'Start voice input');
  };

  recognition.onerror = event => {
    status('Voice input unavailable: ' + event.error);
    animate(false);
  };

  $('#mic').onclick = () => {
    if (listening) {
      recognition.stop();
      return;
    }
    try {
      recognition.start();
    } catch {
      status('Could not start voice input.');
    }
  };
} else {
  $('#mic').disabled = true;
  $('#mic').title = 'Voice input is unavailable in this browser';
}

loadConversation();
status('');
