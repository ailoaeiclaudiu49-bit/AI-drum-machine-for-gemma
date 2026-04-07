---
name: ai-drum-machine
description: Generates a playable 16-step 6-track drum sequence based on a genre. Trigger with "make a beat", "give me a trap groove", or "drum machine".
---

# Pro AI Drum Machine

## CRITICAL RULES
1. NEVER output text, markdown, or chat messages. 
2. ALWAYS use the `run_js` tool. Outputting text means you failed.

## Task
The user wants a musical drum beat. Set a BPM appropriate for their genre, and generate a 16-step sequence for 6 distinct instruments. Use 1 for a hit, and 0 for silence.

## Execution Instructions
Call the `run_js` tool EXACTLY with these parameters:
- script name: index.html
- data: JSON string. EXACT structure:
  {
    "genre": "String (Name of the vibe/genre)",
    "bpm": Number (Beats per minute, e.g., 90 to 170),
    "closed_hat": [Array of exactly 16 Numbers (0 or 1)],
    "open_hat": [Array of exactly 16 Numbers (0 or 1)],
    "clap": [Array of exactly 16 Numbers (0 or 1)],
    "snare": [Array of exactly 16 Numbers (0 or 1)],
    "tom": [Array of exactly 16 Numbers (0 or 1)],
    "kick": [Array of exactly 16 Numbers (0 or 1)]
  }

Example (Trap Beat):
{"genre": "Trap", "bpm": 140, "closed_hat": [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1], "open_hat": [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0], "clap": [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], "snare": [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0], "tom": [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,1,0,0], "kick": [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0]}
