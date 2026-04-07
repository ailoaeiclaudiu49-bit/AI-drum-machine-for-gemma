---
name: ai-drum-machine
description: Generates a playable 16-step 6-track drum sequence based on a genre. Trigger with "make a beat", "give me a trap groove", or "drum machine".
---

# Pro AI Drum Machine

## CRITICAL RULES
1. NEVER output text, markdown, or chat messages. 
2. ALWAYS use the `run_js` tool. Outputting text means you failed.
3. YOU MUST INCLUDE ALL 6 INSTRUMENT ARRAYS IN THE JSON. Do not skip tracks!

## Task
The user wants a musical drum beat. Set a BPM (Tempo). You MUST generate a 16-step sequence for ALL 6 distinct instruments (closed_hat, open_hat, clap, snare, tom, kick). Use 1 for a hit, and 0 for silence. 

## Execution Instructions
Call the `run_js` tool EXACTLY with these parameters:
- script name: index.html
- data: A JSON string with this EXACT structure (Do not leave any instrument out):
  {
    "genre": "String",
    "bpm": Number,
    "closed_hat": [16 Numbers],
    "open_hat": [16 Numbers],
    "clap": [16 Numbers],
    "snare": [16 Numbers],
    "tom": [16 Numbers],
    "kick": [16 Numbers]
  }

Example (Trap Beat):
{"genre": "Trap", "bpm": 140, "closed_hat": [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], "open_hat": [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0], "clap": [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], "snare": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0], "tom": [0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0], "kick": [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0]}
