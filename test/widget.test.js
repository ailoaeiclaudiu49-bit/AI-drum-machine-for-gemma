const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../assets/widget.html'), 'utf8');

describe('Widget Audio Engine', () => {
  let dom;
  let window;
  let mockResume;
  let mockAudioContext;

  beforeEach(() => {
    mockResume = jest.fn();
    mockAudioContext = jest.fn().mockImplementation(() => ({
      state: 'running',
      resume: mockResume,
    }));

    // Setting up JSDOM with beforeParse to inject mocks before script runs
    dom = new JSDOM(html, {
      runScripts: "dangerously",
      beforeParse(window) {
        window.AudioContext = mockAudioContext;
        window.webkitAudioContext = mockAudioContext;
      }
    });
    window = dom.window;
  });

  it('should initialize audio context if it does not exist', () => {
    // Reset any state that might have been initialized
    window.audioCtx = undefined;
    window.initAudio();
    expect(mockAudioContext).toHaveBeenCalledTimes(1);
  });

  it('should not initialize a new audio context if one already exists', () => {
    window.audioCtx = undefined;
    window.initAudio();
    window.initAudio();
    expect(mockAudioContext).toHaveBeenCalledTimes(1); // Only called once
  });

  it('should call resume if the audio context state is suspended', () => {
    // In widget.html, `audioCtx` is a let variable in the script scope
    // But since it's not exported, trying to mock `window.audioCtx` won't work
    // We should change the mock AudioContext implementation for this test
    const mockSuspendedResume = jest.fn();
    const mockSuspendedAudioContext = jest.fn().mockImplementation(() => ({
      state: 'suspended',
      resume: mockSuspendedResume,
    }));

    const domSuspended = new JSDOM(html, {
      runScripts: "dangerously",
      beforeParse(win) {
        win.AudioContext = mockSuspendedAudioContext;
        win.webkitAudioContext = mockSuspendedAudioContext;
      }
    });

    // We can't access audioCtx directly, but initAudio() initializes it
    // if it's falsy, so we can just call it to set it up
    domSuspended.window.audioCtx = undefined;
    domSuspended.window.initAudio();

    // Check if resume was called since state is suspended
    expect(mockSuspendedResume).toHaveBeenCalledTimes(1);
  });
});
