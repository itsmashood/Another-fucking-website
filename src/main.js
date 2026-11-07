import './style.css';
import { startScene } from './scene.js';
import { createSupportResponder } from './support.js';

const animate = startScene();
const respond = createSupportResponder();
const $ = selector => document.querySelector(selector);
const storageKey = 'talktome-support-chat';
let conversation = [];
let listening = false;

function status(text = '') {
  $('#status').textContent = text;
  $('#status').hidden = !text;
}
function saveConversation() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(conversation));
  } catch {
    status('Could not save chat history. Your browser storage might be full or disabled.');
  }
}
function bubble(text, role, persist = true) {
  const el = document.createElement('div');
  el.className = 'bubble ' + role;
  el.textContent = text;
  $('#conversation').append(el);
  if (persist) {
    conversation.push({ role, text, created_at: new Date().toISOString() });
    saveConversation();
  }
  $('#conversation').scrollTop = $('#conversation').scrollHeight;
}
function renderConversation() {
  $('#conversation').replaceChildren();
  for (const item of conversation) bubble(item.text, item.role, false);
}
function loadConversation() {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) || '[]');
    conversation = Array.isArray(raw)
      ? raw.filter(item => item && typeof item.text === 'string' && ['user','assistant'].includes(item.role))
      : [];
    renderConversation();
  } catch {
    conversation = [];
    status('Could not load your chat history.');
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
function button(parent, text, action, className = '') {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = text;
  if (className) b.className = className;
  b.onclick = action;
  parent.append(b);
  return b;
}
function exportBackup() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(conversation,null,2)], { type:'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'talktome-chat-backup.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function showBackups() {
  const p = panel('Your chat');
  paragraph(p, 'Chats stay in this browser. They are not synced to other devices, and anyone using this browser profile may be able to read them.');
  button(p, 'Export chat', exportBackup);
  const file = document.createElement('input');
  file.type = 'file';
  file.accept = '.json,application/json';
  file.hidden = true;
  p.append(file);
  button(p, 'Import chat', () => file.click());
  button(p, 'Clear chat', () => {
    if (!confirm('Delete this chat from this browser?')) return;
    conversation = [];
    saveConversation();
    renderConversation();
    $('#panel').close();
    status('Chat cleared.');
  }, 'danger-button');
  const disclaimer = document.createElement('div');
  disclaimer.className = 'disclaimer';
  paragraph(disclaimer, 'TalkToMe uses simple on-device response patterns, not a clinical service or a full AI model. It may misunderstand or miss serious risk. If you are in immediate danger, contact local emergency services.');
  p.append(disclaimer);
  file.onchange = async () => {
    try {
      if (!file.files[0]) return;
      if (file.files[0].size > 3_000_000) throw new Error('File too large.');
      const imported = JSON.parse(await file.files[0].text());
      if (!Array.isArray(imported) || !imported.every(item => item && typeof item.text === 'string' && ['user','assistant'].includes(item.role))) throw new Error('Invalid backup.');
      conversation = imported.slice(-600);
      saveConversation();
      renderConversation();
      $('#panel').close();
      status('Chat restored.');
    } catch {
      status('Could not import this backup.');
    }
  };
}
$('#account').onclick = showBackups;
$('#close').onclick = () => $('#panel').close();

$('#chat').onsubmit = event => {
  event.preventDefault();
  const text = $('#message').value.trim();
  if (!text) return;
  $('#message').value = '';
  bubble(text, 'user');
  bubble(respond(text), 'assistant');
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
    $('#mic').setAttribute('aria-label','Stop voice input');
    status('Listening…');
  };
  recognition.onresult = event => {
    $('#message').value = event.results[0][0].transcript;
    status('');
  };
  recognition.onend = () => {
    listening = false;
    animate(false);
    $('#mic').setAttribute('aria-label','Start voice input');
  };
  recognition.onerror = () => {
    status('Voice input is unavailable in this browser.');
    animate(false);
  };
  $('#mic').onclick = () => {
    if (listening) return recognition.stop();
    try { recognition.start(); }
    catch { status('Could not start voice input.'); }
  };
} else {
  $('#mic').disabled = true;
  $('#mic').title = 'Voice input is unavailable in this browser';
}
addEventListener('storage', event => { if (event.key === storageKey) loadConversation(); });
loadConversation();
