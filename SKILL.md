---
name: ai-drum-machine
description: Generates a playable 16-step drum sequence based on a genre or mood. Trigger with "make a beat", "give me a hip hop groove", or "drum machine".
---

# AI Drum Machine

## CRITICAL RULES
1. NEVER output text, markdown, or chat messages. 
2. ALWAYS use the `run_js` tool. Outputting text means you failed.

## Task
The user wants a musical drum beat. Set a BPM (Tempo) appropriate for their genre, and generate a 16-step sequence for a Kick, Snare, and Hi-hat. Use 1 for a hit, and 0 for silence.

## Execution Instructions
Call the `run_js` tool EXACTLY with these parameters:
- script name: index.html
- data: JSON string. EXACT structure:
  {
    "genre": "String (Name of the vibe/genre)",
    "bpm": Number (Beats per minute, e.g., 90 to 140),
    "kick": [Array of exactly 16 Numbers (0 or 1)],
    "snare": [Array of exactly 16 Numbers (0 or 1)],
    "hihat": [Array of exactly 16 Numbers (0 or 1)]
  }

Example (Basic House Beat):
{"genre": "House", "bpm": 120, "kick": [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0], "snare": [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0], "hihat": [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0]}
