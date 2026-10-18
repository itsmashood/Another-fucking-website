(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const audio = $('music');
  const playlist = (window.SITE_SONGS || []).map(song => ({...song}));
  let current = 0, playRequest = 0, seeking = false;
  audio.volume = .4;
  function format(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  }
  function updateTime() {
    const duration = audio.duration;
    $('current-time').textContent = format(audio.currentTime);
    $('duration').textContent = format(duration);
    $('seek').disabled = !Number.isFinite(duration) || duration <= 0;
    if (!seeking) $('seek').value = Number.isFinite(duration) && duration > 0 ? audio.currentTime / duration * 100 : 0;
  }
  function updateState() {
    const playing = !audio.paused;
    $('music-toggle').textContent = playing ? 'Ⅱ' : '▶';
    $('music-toggle').setAttribute('aria-label', playing ? 'Pause' : 'Play');
    $('music-toggle').setAttribute('aria-pressed', String(playing));
    $('playback-status').textContent = playing ? 'Playing' : 'Paused';
  }
  function renderPlaylist() {
    $('playlist').replaceChildren();
    $('track-count').textContent = `${playlist.length} ${playlist.length === 1 ? 'track' : 'tracks'}`;
    $('previous').disabled = $('next').disabled = playlist.length < 2;
    $('music-toggle').disabled = playlist.length === 0;
    playlist.forEach((song, index) => {
      const row = document.createElement('li'); row.className = 'song-row';
      const button = document.createElement('button'); button.className = 'song-button';
      button.setAttribute('aria-current', String(index === current));
      button.setAttribute('aria-label', `Play ${song.title}${song.artist ? ' by ' + song.artist : ''}`);
      const number = document.createElement('span'); number.className = 'song-number'; number.textContent = index + 1;
      const name = document.createElement('span'); name.className = 'song-name'; name.textContent = song.title;
      button.append(number, name); button.addEventListener('click', () => select(index, true)); row.append(button);
      if (song.local) {
        const remove = document.createElement('button'); remove.className = 'remove-song'; remove.textContent = '×';
        remove.setAttribute('aria-label', `Remove ${song.title}`);
        remove.addEventListener('click', () => removeSong(index)); row.append(remove);
      }
      $('playlist').append(row);
    });
  }
  async function play() {
    if (!playlist.length) return;
    const request = ++playRequest;
    try { await audio.play(); }
    catch (error) {
      if (request !== playRequest || error.name === 'AbortError') return;
      updateState();
      $('playback-status').textContent = 'Unable to play';
      $('announcement').textContent = 'This song could not play. Try another audio file.';
    }
  }
  function select(index, start = false) {
    if (!playlist.length) return;
    playRequest++;
    audio.pause();
    current = ((index % playlist.length) + playlist.length) % playlist.length;
    const song = playlist[current];
    audio.src = song.src;
    $('track-title').textContent = song.title;
    $('track-artist').textContent = song.artist || 'Added from your device';
    audio.load();
    $('seek').value = 0;
    $('seek').disabled = true;
    $('current-time').textContent = $('duration').textContent = '0:00';
    updateState(); renderPlaylist();
    if (start) play();
  }
  function removeSong(index) {
    const song = playlist[index];
    if (!song?.local) return;
    const wasPlaying = !audio.paused;
    const isCurrent = index === current;
    if (isCurrent) { ++playRequest; audio.pause(); }
    playlist.splice(index, 1);
    if (isCurrent) select(Math.min(index, playlist.length - 1), wasPlaying);
    else { if (index < current) current--; renderPlaylist(); }
    URL.revokeObjectURL(song.src);
  }
  $('music-toggle').addEventListener('click', () => {
    if (audio.paused) play(); else { ++playRequest; audio.pause(); }
  });
  $('previous').addEventListener('click', () => select(current - 1, !audio.paused));
  $('next').addEventListener('click', () => select(current + 1, !audio.paused));
  audio.addEventListener('ended', () => select(current + 1, true));
  audio.addEventListener('play', updateState);
  audio.addEventListener('pause', updateState);
  ['timeupdate', 'loadedmetadata', 'durationchange'].forEach(event => audio.addEventListener(event, updateTime));
  audio.addEventListener('error', () => {
    updateState();
    $('playback-status').textContent = 'File unavailable';
    $('announcement').textContent = 'This audio file is missing or unsupported. Choose another song.';
  });
  $('seek').addEventListener('input', e => {
    seeking = true;
    if (Number.isFinite(audio.duration)) $('current-time').textContent = format(Number(e.target.value) / 100 * audio.duration);
  });
  $('seek').addEventListener('change', e => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = Number(e.target.value) / 100 * audio.duration;
    seeking = false; updateTime();
  });
  $('seek').addEventListener('blur', () => { seeking = false; updateTime(); });
  $('volume').addEventListener('input', e => { audio.volume = Number(e.target.value); });
  $('add-songs').addEventListener('click', () => $('song-files').click());
  $('song-files').addEventListener('change', e => {
    let added = 0;
    for (const file of e.target.files) {
      if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|flac|aac|opus)$/i.test(file.name)) continue;
      playlist.push({ title:file.name.replace(/\.[^.]+$/, ''), artist:'', src:URL.createObjectURL(file), local:true }); added++;
    }
    renderPlaylist();
    $('announcement').textContent = added ? `${added} ${added === 1 ? 'song' : 'songs'} added.` : 'Choose supported audio files.';
    e.target.value = '';
  });
  window.addEventListener('pagehide', e => {
    if (!e.persisted) playlist.filter(song => song.local).forEach(song => URL.revokeObjectURL(song.src));
  });
  select(0);
})();
