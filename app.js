(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const audio = $('music');
  const songs = (window.SITE_SONGS || []).filter(song => song && song.src).map(song => ({...song}));
  let current = 0, request = 0, pending = false, seeking = false, failure = '';
  try { const saved = localStorage.getItem('radia-volume'); audio.volume = saved !== null && Number.isFinite(Number(saved)) ? Math.min(1, Math.max(0, Number(saved))) : .4; } catch (_) { audio.volume = .4; }
  $('volume').value = audio.volume;
  const time = seconds => Number.isFinite(seconds) && seconds >= 0 ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '0:00';
  function setProgress(percent) {
    const value = Math.max(0, Math.min(100, Number(percent) || 0));
    $('seek').value = value;
    $('seek').style.setProperty('--progress', `${value}%`);
  }
  function updateTime() {
    const duration = audio.duration;
    $('duration').textContent = time(duration);
    $('seek').disabled = !Number.isFinite(duration) || duration <= 0;
    if (!seeking) {
      $('current-time').textContent = time(audio.currentTime);
      setProgress(Number.isFinite(duration) && duration > 0 ? audio.currentTime / duration * 100 : 0);
    }
  }
  function updateState() {
    const playing = !audio.paused && !audio.ended && !failure;
    $('player').classList.toggle('is-playing', Boolean(playing));
    $('music-toggle').setAttribute('aria-pressed', String(Boolean(playing)));
    $('music-toggle').setAttribute('aria-label', `${playing || pending ? 'Pause' : 'Play'} ${songs[current]?.title || 'music'}`);
    $('playback-status').textContent = failure || (pending ? 'Loading…' : playing ? 'Playing' : songs.length ? 'Paused' : 'No audio added');
  }
  async function play() {
    if (!songs.length) return;
    const token = ++request;
    failure = ''; pending = true;
    if (audio.error) audio.load();
    updateState();
    try { await audio.play(); }
    catch (error) {
      if (token !== request) return;
      if (error.name !== 'AbortError') {
        failure = 'Unable to play. Press play to retry.';
        $('announcement').textContent = 'The audio could not play. Press play to retry.';
      }
    } finally { if (token === request) { pending = false; updateState(); } }
  }
  function pause() { ++request; pending = false; audio.pause(); updateState(); }
  function select(index, start = false) {
    if (!songs.length) return;
    pause(); failure = ''; current = ((index % songs.length) + songs.length) % songs.length;
    audio.src = songs[current].src; audio.load();
    $('track-title').textContent = songs[current].title || 'Untitled';
    $('track-artist').textContent = songs[current].artist || '';
    $('duration').textContent = $('current-time').textContent = '0:00';
    $('seek').disabled = true; seeking = false; setProgress(0); updateState();
    if (start) play();
  }
  $('track-count').textContent = `${songs.length} ${songs.length === 1 ? 'track' : 'tracks'}`;
  $('previous').hidden = $('next').hidden = songs.length < 2;
  $('previous').disabled = $('next').disabled = songs.length < 2;
  $('music-toggle').disabled = songs.length === 0;
  $('music-toggle').addEventListener('click', () => { if (pending || !audio.paused) pause(); else play(); });
  $('previous').addEventListener('click', () => select(current - 1, pending || !audio.paused));
  $('next').addEventListener('click', () => select(current + 1, pending || !audio.paused));
  audio.addEventListener('ended', () => select(current + 1, true));
  audio.addEventListener('play', () => { failure = ''; pending = false; updateState(); });
  audio.addEventListener('pause', updateState);
  audio.addEventListener('waiting', () => { if (!audio.paused) $('playback-status').textContent = 'Buffering…'; });
  audio.addEventListener('playing', updateState);
  ['timeupdate', 'loadedmetadata', 'durationchange'].forEach(event => audio.addEventListener(event, updateTime));
  audio.addEventListener('error', () => { ++request; pending = false; failure = 'Audio unavailable. Press play to retry.'; updateState(); $('announcement').textContent = 'The audio file could not be loaded.'; });
  $('seek').addEventListener('input', e => {
    seeking = true; setProgress(e.target.value);
    if (Number.isFinite(audio.duration)) $('current-time').textContent = time(Number(e.target.value) / 100 * audio.duration);
  });
  $('seek').addEventListener('change', e => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = Math.min(audio.duration, Math.max(0, Number(e.target.value) / 100 * audio.duration));
    seeking = false; updateTime();
  });
  $('seek').addEventListener('blur', () => { seeking = false; updateTime(); });
  $('volume').addEventListener('input', e => {
    audio.volume = Number(e.target.value);
    try { localStorage.setItem('radia-volume', String(audio.volume)); } catch (_) {}
  });
  if (songs.length) select(0);
  else { $('track-title').textContent = 'No audio'; $('track-artist').textContent = ''; updateState(); }
})();
