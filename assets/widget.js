// State
let isPlaying = false;
let currentStep = 0;
let bpm = 120;
let timerID;
let audioCtx;

// Order of tracks from top to bottom
const instruments = ['closed_hat', 'open_hat', 'clap', 'snare', 'tom', 'kick'];
const trackNames = {'closed_hat': 'Closed Hat', 'open_hat': 'Open Hat', 'clap': 'Clap', 'snare': 'Snare', 'tom': 'Tom', 'kick': 'Kick'};

let pattern = {};
instruments.forEach(inst => pattern[inst] = new Array(16).fill(0));

// --- AUDIO ENGINE ---
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playKick(time) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
  gain.gain.setValueAtTime(1, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
  osc.start(time); osc.stop(time + 0.5);
}

function playTom(time) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(200, time); // Higher than kick
  osc.frequency.exponentialRampToValueAtTime(50, time + 0.3);
  gain.gain.setValueAtTime(0.8, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
  osc.start(time); osc.stop(time + 0.3);
}

function playSnare(time) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(250, time);
  gain.gain.setValueAtTime(0.8, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
  osc.start(time); osc.stop(time + 0.2);
  playNoise(time, 0.2, 2000, 'highpass');
}

function playClap(time) {
  // Claps are actually multiple quick noise bursts
  playNoise(time, 0.15, 1000, 'bandpass', 0.8);
  playNoise(time + 0.01, 0.15, 1000, 'bandpass', 0.8);
  playNoise(time + 0.02, 0.2, 1000, 'bandpass', 1);
}

function playClosedHat(time) {
  playNoise(time, 0.05, 7000, 'highpass', 0.5);
}

function playOpenHat(time) {
  playNoise(time, 0.3, 7000, 'highpass', 0.5); // Longer decay
}

// Generic Noise Generator for Hats, Snares, Claps
function playNoise(time, duration, filterFreq, filterType, vol=0.6) {
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = filterType; filter.frequency.value = filterFreq;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(vol, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

  noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
  noise.start(time);
}

// --- UI BUILDER ---
const container = document.getElementById('tracks-container');
instruments.forEach(inst => {
  const trackDiv = document.createElement('div');
  trackDiv.className = 'track';

  const label = document.createElement('div');
  label.className = 'row-label';
  label.innerText = trackNames[inst];
  trackDiv.appendChild(label);

  const grid = document.createElement('div');
  grid.className = 'grid';
  grid.id = `grid-${inst}`;

  for (let i = 0; i < 16; i++) {
    const pad = document.createElement('div');
    pad.className = 'pad';
    pad.id = `pad-${inst}-${i}`;
    pad.addEventListener("click", () => {
      pattern[inst][i] = pattern[inst][i] ? 0 : 1;
      pad.classList.toggle('active');
    });

    grid.appendChild(pad);
  }
  trackDiv.appendChild(grid);
  container.appendChild(trackDiv);
});

function updateGridVisuals() {
  instruments.forEach(inst => {
    for (let i = 0; i < 16; i++) {
      const pad = document.getElementById(`pad-${inst}-${i}`);
      if (pattern[inst][i]) pad.classList.add('active');
      else pad.classList.remove('active');
    }
  });
}

// --- SEQUENCER LOGIC ---
function nextNote() {
  const time = audioCtx.currentTime + 0.05;
  if (pattern.kick[currentStep]) playKick(time);
  if (pattern.tom[currentStep]) playTom(time);
  if (pattern.snare[currentStep]) playSnare(time);
  if (pattern.clap[currentStep]) playClap(time);
  if (pattern.closed_hat[currentStep]) playClosedHat(time);
  if (pattern.open_hat[currentStep]) playOpenHat(time);

  document.querySelectorAll('.pad').forEach(p => p.classList.remove('playing'));
  instruments.forEach(inst => {
    document.getElementById(`pad-${inst}-${currentStep}`).classList.add('playing');
  });

  currentStep = (currentStep + 1) % 16;
}

function scheduler() {
  nextNote();
  const secondsPerBeat = 60.0 / bpm;
  timerID = setTimeout(scheduler, (secondsPerBeat / 4) * 1000);
}

function togglePlay() {
  initAudio();
  const btn = document.getElementById('playBtn');
  if (isPlaying) {
    clearTimeout(timerID);
    btn.innerText = 'Play'; btn.classList.remove('stop');
    document.querySelectorAll('.pad').forEach(p => p.classList.remove('playing'));
  } else {
    currentStep = 0;
    scheduler();
    btn.innerText = 'Stop'; btn.classList.add('stop');
  }
  isPlaying = !isPlaying;
}

function updateBPM(val) {
  bpm = val;
  document.getElementById('screen').innerText = `BPM: ${bpm} | GENRE: AI CUSTOM`;
}

// Attach event listeners to elements to avoid inline event handlers
document.getElementById('playBtn').addEventListener('click', togglePlay);
document.getElementById('bpmSlider').addEventListener('input', function(event) {
  updateBPM(event.target.value);
});

// --- DATA LOADING ---
const params = new URLSearchParams(window.location.search);
try {
  if (params.has('data')) {
    const parsed = JSON.parse(decodeURIComponent(params.get('data')));
    instruments.forEach(inst => {
      if (parsed[inst]) pattern[inst] = parsed[inst];
    });
    if (parsed.bpm) { bpm = parsed.bpm; document.getElementById('bpmSlider').value = bpm; }
    document.getElementById('screen').innerText = `BPM: ${bpm} | GENRE: ${parsed.genre || 'AI'}`;
    updateGridVisuals();
  }
} catch (e) { console.error("Parse error", e); }
