/* ==========================================================================
   KEEPER OF THE SOURCE: THE HISTORICAL INQUIRY SIMULATOR
   ========================================================================== */

"use strict";

function handleKeySelect(e, callback, arg) {
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    callback(arg);
  }
}

// Game State
const state = {
  screen: "title",
  level: 1, // 1 to 4
  soundOn: false,
  stats: {
    challenge: 0,
    barrier: 0,
    schema: 0 // Target: 100%
  },
  levelAnswers: [],
  meanChallenge: 0,
  meanAccessibility: 0,
  schemaIntegrity: "Low"
};

// Web Audio API Context & Nodes
let audioCtx = null;
let bgHum = null;
let levelOsc = null;

// Canvas Particles
let bgCanvas = null;
let bgCtx = null;
let particleEngine = null;
let gameLoopId = null;

// Level Data Definition
const levels = {
  1: {
    name: "Level 1 &middot; Noetic Sourcing",
    env: "noetic",
    tutor: "Socrates the Archivist",
    avatar: "📜",
    dialogue: "Look at the S.M.O.O.T.H. Engine's record of the Stamp Act. It claims all colonists reacted with unified, peaceful patriotism. That is too clean. Introduce noetic struggle by auditing this text with primary source fragments.",
    title: "Sourcing Audit",
    prompt: "Audit the AI summary. Click on a red dashed 'Bypass Zone' in the essay, then select the matching Primary Source Fragment to resolve the flattened narrative.",
    options: []
  },
  2: {
    name: "Level 2 &middot; Rhetorical Contextualization",
    env: "rhetorical",
    tutor: "Sophia of the Agora",
    avatar: "👥",
    dialogue: "Our student is using a compliant AI chat partner that agrees with everything they write. This creates 'rhetorical saturation'—a frictionless echo chamber. Let's inject peer friction into this Socratic Seminar table.",
    title: "Socratic Dialogic Table",
    prompt: "Choose the C.O.R.E. prompts (Critical Thinking, Openness, Respect, Engagement) to challenge the student's claims and break the synthetic consensus.",
    options: []
  },
  3: {
    name: "Level 3 &middot; Existential Corroboration",
    env: "existential",
    tutor: "Covenant Guardian",
    avatar: "✒️",
    dialogue: "We must restore the student's personal stakes in the argument. The AI has offered to auto-write their final letter to the editor. Redesign this exit move: demand a revision history and an authorial signature to commit to their claims.",
    title: "The Authorial Desk",
    prompt: "Audit the revision timeline to match the claim changes, then type your signature to commit to the historical argument.",
    options: []
  },
  4: {
    name: "Level 4 &middot; Infrastructural Policy",
    env: "infrastructural",
    tutor: "Director of Curricula",
    avatar: "🛠️",
    dialogue: "The final barrier is system-wide. We must configure school AI policies to support equity and access without enabling cognitive bypass. Calibrate task settings for three distinct student profiles.",
    title: "Inquiry Calibration Lab",
    prompt: "Adjust the Sliders (Challenge vs. Accessibility) for each student profile to ensure effortful schema assembly.",
    options: []
  }
};

// Student Profiles for Level 4
const studentProfiles = [
  {
    name: "Profile 1: English Language Learner (ELL)",
    desc: "Goal: Remove vocabulary/translation barriers (exclusionary) while preserving critical source synthesis (noetic struggle).",
    targetAssist: 85, 
    targetStruggle: 70,
    successMsg: "Calibrated! AI bilingual translation allows structural access, while source analysis maintains rigorous noetic struggle."
  },
  {
    name: "Profile 2: Student with Dysgraphia",
    desc: "Goal: Eliminate writing/typing motor exhaustion (exclusionary) while ensuring evidence chains are defended (cognitive rigor).",
    targetAssist: 80, 
    targetStruggle: 75,
    successMsg: "Calibrated! Speech-to-text tools clear physical obstacles, while mandatory oral defense guards noetic struggle."
  },
  {
    name: "Profile 3: Frictionless Bypass default",
    desc: "Goal: Challenge a high-achieving student who defaults to generating complete essays with AI.",
    targetAssist: 15, 
    targetStruggle: 90,
    successMsg: "Calibrated! AI generation is restricted, forcing direct interaction with primary texts and deep revision logs."
  }
];
let currentProfileIdx = 0;

// Sandbox Quiz Scenarios (10 Scenarios)
const scenarios = [
  {
    text: "A teacher asks students to generate an AI summary of a civil rights march, annotate a primary document from a participant, and write a ledger documenting where the AI and primary accounts conflict.",
    options: [
      { text: "Noetic Friction (The Head)", correct: true, feedback: "Correct! Contrasting the primary source annotations with the AI summary forces internal cognitive labor and prevents passive text consumption." },
      { text: "Rhetorical Friction (The Room)", correct: false, feedback: "Incorrect. The Room is for dialogic peer-to-peer friction, whereas this task focuses on internal source analysis." },
      { text: "Existential Friction (The World)", correct: false, feedback: "Incorrect. This focuses on evidence analysis rather than personal authorial stakes." },
      { text: "Exclusionary Blockade", correct: false, feedback: "Incorrect. This is productive difficulty, not a barrier to access." }
    ]
  },
  {
    text: "Students are divided into panels where they must take opposing viewpoints on an international trade treaty, defending their claims using evidence while arguing with peer-directed questions.",
    options: [
      { text: "Rhetorical Friction (The Room)", correct: true, feedback: "Correct! The Room is the locus of dialogic resistance, where claims must survive opposing viewpoints from other minds." },
      { text: "Noetic Friction (The Head)", correct: false, feedback: "Incorrect. While cognitive effort is involved, the primary medium here is dialogic peer exchange." },
      { text: "Infrastructural Friction", correct: false, feedback: "Incorrect. This is a classroom learning interaction (Rhetorical) rather than a system-level policy." },
      { text: "Existential Friction (The World)", correct: false, feedback: "Incorrect. Close, but peer dialogic confrontation is the hallmark of Rhetorical friction." }
    ]
  },
  {
    text: "A school district completely blocks all generative AI sites on the school network, preventing an ELL student from using a translation chatbot to clarify archaic wording in colonial petitions.",
    options: [
      { text: "Exclusionary Blockade", correct: true, feedback: "Correct! An outright ban introduces an exclusionary structural barrier that locks out language access without building historical reasoning." },
      { text: "Productive Difficulty", correct: false, feedback: "Incorrect. Depriving an ELL student of basic comprehension tools is not a desirable difficulty." },
      { text: "Noetic Friction", correct: false, feedback: "Incorrect. This is a mechanical barrier that prevents noetic work from starting." },
      { text: "Infrastructural Friction", correct: false, feedback: "Incorrect. While it's a policy change, its practical outcome is an Exclusionary Blockade for the student." }
    ]
  },
  {
    text: "Before submitting a research paper, students must submit a 2-minute video explaining their own claim's revision path: how and why their stance changed after analyzing primary documents.",
    options: [
      { text: "Existential Friction (The World)", correct: true, feedback: "Correct! Forcing students to show their face and verbally sign their name to their claim's evolution establishes personal, embodied accountability." },
      { text: "Infrastructural Friction", correct: false, feedback: "Incorrect. This is an assessment design that focuses on authorship (Existential) rather than policy structures." },
      { text: "Rhetorical Friction (The Room)", correct: false, feedback: "Incorrect. This is a personal reflection on one's own work, not a peer-to-peer Socratic discussion." },
      { text: "Noetic Friction (The Head)", correct: false, feedback: "Incorrect. It protects noetic work, but the video explanation and authorship signature make it Existential." }
    ]
  },
  {
    text: "A school board reformulates its grading policy to evaluate the process of writing (outline, revisions, reflection notes) rather than grading only the final, easily automated PDF output.",
    options: [
      { text: "Infrastructural Friction (The System)", correct: true, feedback: "Correct! System-level grading criteria and policies shape the conditions of possibility for productive struggle." },
      { text: "Noetic Friction (The Head)", correct: false, feedback: "Incorrect. The policy supports noetic friction, but the policy itself is Infrastructural." },
      { text: "Rhetorical Friction (The Room)", correct: false, feedback: "Incorrect. This refers to system policies, not dialogic peer environments." },
      { text: "Productive Difficulty", correct: false, feedback: "Incorrect. It structures productive difficulties, but the locus is Infrastructural." }
    ]
  },
  {
    text: "A student with severe dysgraphia uses an AI speech-to-text engine to dictate historical claims, but is required to manually diagram the evidence connections on a whiteboard.",
    options: [
      { text: "Calibrated Productive Friction", correct: true, feedback: "Correct! Dictation eliminates the exclusionary physical barrier of dysgraphia, while the diagramming preserves the productive cognitive challenge." },
      { text: "Frictionless Bypass", correct: false, feedback: "Incorrect. The student still had to organize and diagram the evidence, so it was not a bypass." },
      { text: "Exclusionary Blockade", correct: false, feedback: "Incorrect. The dictation tool successfully prevented a blockade." },
      { text: "Existential Friction", correct: false, feedback: "Incorrect. It represents calibrated equity design." }
    ]
  },
  {
    text: "A student prompts an AI to write an entire historical essay on the Causes of the Cold War, copies the text directly, and submits it for an A, without reading a single source.",
    options: [
      { text: "Frictionless Bypass (Unproductive Success)", correct: true, feedback: "Correct! This is the 'Great Bypass'—a perfect grade is achieved without any cognitive effort, leaving no trace in the student's schema." },
      { text: "Exclusionary Blockade", correct: false, feedback: "Incorrect. Bypassing struggle is the opposite of a blockade." },
      { text: "Noetic Friction", correct: false, feedback: "Incorrect. The cognitive friction was completely bypassed." },
      { text: "Rhetorical Saturation", correct: false, feedback: "Incorrect. This is noetic displacement/bypass, not a dialogic issue." }
    ]
  },
  {
    text: "An AI tutor chatbot is configured to immediately tell the student the exact historical causes of the Stamp Act instead of guiding them to notice details in primary sources.",
    options: [
      { text: "Noetic Displacement", correct: true, feedback: "Correct! The AI delivers the final synthesis instantly, displacing the student's cognitive task of sourcing and interpretation." },
      { text: "Rhetorical Saturation", correct: false, feedback: "Incorrect. This is direct answer delivery (Noetic Displacement) rather than compliant dialogic saturation." },
      { text: "Exclusionary Blockade", correct: false, feedback: "Incorrect. The student got the answer instantly; it's a bypass, not a blockade." },
      { text: "Existential Abstraction", correct: false, feedback: "Incorrect. This refers to direct cognitive bypass." }
    ]
  },
  {
    text: "A student works with an AI chat agent that always agrees with their interpretations of the US Constitution, never introducing counter-evidence or challenging their assumptions.",
    options: [
      { text: "Rhetorical Saturation", correct: true, feedback: "Correct! The student has a compliant conversational partner. Without dialogic friction, their assumptions remain unchecked." },
      { text: "Existential Abstraction", correct: false, feedback: "Incorrect. This is a breakdown in peer dialogue (Rhetorical) rather than authorial commitment (Existential)." },
      { text: "Noetic Displacement", correct: false, feedback: "Incorrect. It displaces thinking, but specifically in the interactive dialogue phase." },
      { text: "Infrastructural Friction", correct: false, feedback: "Incorrect. This is a dialogic bypass scenario." }
    ]
  },
  {
    text: "A social studies rubric includes a 'Friction Signature' section, where students must log the specific moments they were confused and how they resolved it using evidence.",
    options: [
      { text: "Existential Friction (The World)", correct: true, feedback: "Correct! Committing to a friction log and signing one's name to a trajectory of struggle establishes personal authorial agency." },
      { text: "Noetic Friction (The Head)", correct: false, feedback: "Incorrect. While it documents noetic struggle, the personal signature and commitment mechanism makes it Existential." },
      { text: "Rhetorical Friction (The Room)", correct: false, feedback: "Incorrect. It is a student-to-work mechanism (Existential) rather than a peer dialogue." },
      { text: "Infrastructural Friction", correct: false, feedback: "Incorrect. The rubric itself is Infrastructural, but the 'Friction Signature' requirement is an Existential check." }
    ]
  }
];
let currentScenarioIdx = 0;
let sandboxScore = 0;
let answeredScenarios = 0;

/* ==========================================================================
   PARTICLE BACKGROUND ENGINE
   ========================================================================== */
class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.maxParticles = 60;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init(mode) {
    this.particles = [];
    this.mode = mode;
    let count = this.maxParticles;

    if (mode === "noetic" || mode === "title") {
      // Warm golden/parchment embers
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height + this.canvas.height,
          size: Math.random() * 3 + 1,
          speedY: -(Math.random() * 1.5 + 0.5),
          speedX: Math.random() * 1 - 0.5,
          color: `rgba(251, 191, 36, ${Math.random() * 0.3 + 0.1})`,
          angle: Math.random() * Math.PI
        });
      }
    } else if (mode === "rhetorical") {
      // Orbiting teal communication nodes
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: this.canvas.width / 2 + (Math.random() * 300 - 150),
          y: this.canvas.height / 2 + (Math.random() * 300 - 150),
          size: Math.random() * 4 + 1.5,
          speedY: Math.random() * 0.6 - 0.3,
          speedX: Math.random() * 0.6 - 0.3,
          color: `rgba(45, 212, 191, ${Math.random() * 0.25 + 0.1})`
        });
      }
    } else if (mode === "existential") {
      // Floating purple ink blotches
      for (let i = 0; i < count / 2; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 40 + 20,
          speedY: Math.random() * 0.2 - 0.1,
          speedX: Math.random() * 0.2 - 0.1,
          color: `rgba(167, 139, 250, ${Math.random() * 0.05 + 0.02})`
        });
      }
    } else if (mode === "infrastructural") {
      // Grid mesh network
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: 2,
          speedY: Math.random() * 0.4 - 0.2,
          speedX: Math.random() * 0.4 - 0.2,
          color: `rgba(244, 63, 94, ${Math.random() * 0.2 + 0.1})`
        });
      }
    } else if (mode === "end") {
      // Festive particles
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 4 + 1,
          speedY: Math.random() * 1 + 0.2,
          speedX: Math.random() * 1 - 0.5,
          color: `rgba(251, 191, 36, ${Math.random() * 0.4 + 0.2})`
        });
      }
    }
  }

  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      for (let p of this.particles) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      }
      return;
    }
    
    for (let p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;

      if (this.mode === "noetic" || this.mode === "title") {
        p.angle += 0.01;
        p.x += Math.sin(p.angle) * 0.2;
        if (p.y < -10) {
          p.y = this.canvas.height + 10;
          p.x = Math.random() * this.canvas.width;
        }
      } else if (this.mode === "end") {
        if (p.y > this.canvas.height + 10) {
          p.y = -10;
          p.x = Math.random() * this.canvas.width;
        }
      } else {
        if (p.x < -p.size) p.x = this.canvas.width + p.size;
        if (p.x > this.canvas.width + p.size) p.x = -p.size;
        if (p.y < -p.size) p.y = this.canvas.height + p.size;
        if (p.y > this.canvas.height + p.size) p.y = -p.size;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
    }

    // Draw lines between particles in infrastructural mode
    if (this.mode === "infrastructural") {
      this.ctx.strokeStyle = "rgba(244, 63, 94, 0.03)";
      this.ctx.lineWidth = 1;
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          let dist = Math.hypot(this.particles[i].x - this.particles[j].x, this.particles[i].y - this.particles[j].y);
          if (dist < 150) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.stroke();
          }
        }
      }
    }
  }
}

// Start game loop
function startGameLoop() {
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
  function loop() {
    particleEngine.update();
    gameLoopId = requestAnimationFrame(loop);
  }
  loop();
}

/* ==========================================================================
   PROCEDURAL SOUNDSYNTH (Web Audio API)
   ========================================================================== */
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  // Ambient Hum
  bgHum = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();
  
  bgHum.type = "sine";
  bgHum.frequency.setValueAtTime(55, audioCtx.currentTime); // Low A hum
  
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(120, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(state.soundOn ? 0.25 : 0.0, audioCtx.currentTime);
  
  bgHum.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  
  bgHum.start();

  // Dynamic Level Synth
  levelOsc = audioCtx.createOscillator();
  const levelGain = audioCtx.createGain();
  levelOsc.type = "triangle";
  levelOsc.frequency.setValueAtTime(110, audioCtx.currentTime);
  levelGain.gain.setValueAtTime(0, audioCtx.currentTime);
  
  levelOsc.connect(levelGain);
  levelGain.connect(audioCtx.destination);
  levelOsc.start();
}

function toggleSound() {
  state.soundOn = !state.soundOn;
  const btn = document.getElementById("soundBtn");
  btn.innerText = state.soundOn ? "SOUND ON" : "SOUND OFF";
  
  if (state.soundOn) {
    if (!audioCtx) {
      initAudio();
    } else if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    // Gain hum nodes
    playNotification(330, "sine", 0.08, 0.1);
  } else {
    if (audioCtx && audioCtx.state === "running") {
      audioCtx.suspend();
    }
  }
}

function playNotification(freq, type, volume, duration) {
  if (!state.soundOn || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type || "sine";
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(volume || 0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playSuccessArpeggio() {
  if (!state.soundOn || !audioCtx) return;
  const notes = [220, 277, 330, 440]; // A Major
  notes.forEach((freq, index) => {
    setTimeout(() => {
      playNotification(freq, "triangle", 0.15, 0.4);
    }, index * 100);
  });
}

function playFailureNoise() {
  if (!state.soundOn || !audioCtx) return;
  const notes = [180, 160, 140];
  notes.forEach((freq, index) => {
    setTimeout(() => {
      playNotification(freq, "sawtooth", 0.12, 0.3);
    }, index * 120);
  });
}

function playSliderTick(freq) {
  if (!state.soundOn || !audioCtx) return;
  playNotification(freq || 440, "sine", 0.05, 0.05);
}

/* ==========================================================================
   NAVIGATION & WIPE TRANSITION
   ========================================================================== */
function go(screenId, envMode) {
  const wipe = document.getElementById("wipe");
  const wipetext = document.getElementById("wipetext");
  
  // Update wipe message based on screen
  if (screenId === "gameScreen") {
    wipetext.innerText = `Calibrating ${levels[state.level].title}...`;
  } else if (screenId === "finaleScreen") {
    wipetext.innerText = "Analyzing Sandbox Outcomes...";
  } else if (screenId === "deepScreen") {
    wipetext.innerText = "Loading Scholar Sandbox...";
  } else {
    wipetext.innerText = "Keeper of the Source";
  }

  wipe.classList.add("active");
  playNotification(220, "sine", 0.1, 0.5);

  setTimeout(() => {
    // Switch active screen
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");
    
    // Switch environment background theme
    document.body.setAttribute("data-env", envMode || "title");
    particleEngine.init(envMode || "title");

    setTimeout(() => {
      wipe.classList.remove("active");
    }, 300);
  }, 650);

  state.screen = screenId;
}

/* ==========================================================================
   CORE CALIBRATION LOGIC
   ========================================================================== */
function updateHUD() {
  // Update HUD Sliders / Bars
  document.getElementById("fidnum").innerText = `${state.stats.challenge}%`;
  document.getElementById("fidbar").querySelector(".bar-fill").style.width = `${state.stats.challenge}%`;

  document.getElementById("reachnum").innerText = `${state.stats.barrier}%`;
  document.getElementById("reachbar").querySelector(".bar-fill").style.width = `${state.stats.barrier}%`;

  // Calculate Schema Assembly
  const challenge = state.stats.challenge;
  const barrier = state.stats.barrier;
  
  let schemaState = 0;
  let statusText = "Frictionless Bypass";
  let statusHeadline = "Frictionless Bypass Mode Active";
  let statusDesc = "Adjust parameters to ensure the student engages in effortful schema construction while remaining supported.";
  let statusColor = "red";

  if (challenge < 40) {
    schemaState = Math.max(10, challenge);
    statusHeadline = "Frictionless Bypass Active";
    statusDesc = "AI is generating full answers instantly. The student is not reading sources or revising claims. Cognitive bypassed.";
    statusColor = "red";
  } else if (barrier > 35) {
    schemaState = Math.max(15, 100 - barrier);
    statusHeadline = "Exclusionary Blockade Active";
    statusDesc = "The student is locked out by handwriting fatigue or language barriers. Friction is mechanical, not noetic. Bypassed.";
    statusColor = "red";
  } else if (challenge >= 50 && challenge <= 80 && barrier <= 20) {
    schemaState = 100;
    statusHeadline = "Calibrated Inquiry Active";
    statusDesc = "desirable difficulty maintained! The student struggles productively with primary texts while barriers are cleared.";
    statusColor = "green";
  } else {
    // Intermediate/Semi-calibrated
    schemaState = 60;
    statusHeadline = "Sub-Optimal Calibration";
    statusDesc = "The struggle is present but slightly miscalibrated. Refine the balance of scaffolds vs critical inquiry.";
    statusColor = "yellow";
  }

  state.stats.schema = schemaState;
  
  document.getElementById("authnum").innerText = `${schemaState}%`;
  
  const dot = document.getElementById("authindicator");
  dot.className = `indicator-dot ${statusColor}`;
  
  document.getElementById("authdesc").innerText = statusHeadline;
  document.getElementById("authflag").innerText = `Calibrated: ${statusColor === "green" ? "YES" : "NO"}`;
  document.getElementById("authflag").style.color = `var(--${statusColor})`;

  document.getElementById("headline").innerText = statusHeadline;
  document.getElementById("headline").style.color = `var(--${statusColor})`;
  document.getElementById("messageText").innerText = statusDesc;
}

/* ==========================================================================
   LEVEL GENERATION AND ACTIONS
   ========================================================================== */
function startGame() {
  state.level = 1;
  state.levelAnswers = [];
  currentProfileIdx = 0;
  const nextBtn = document.getElementById("nextbtn");
  nextBtn.innerText = "CONTINUE CALIBRATION →";
  nextBtn.onclick = advance;
  go("gameScreen", "noetic");
  loadLevel();
}

function loadLevel() {
  const lvl = levels[state.level];
  
  // Update Headers
  document.getElementById("phasechip").innerHTML = lvl.name;
  document.getElementById("roundCounter").innerText = `Stage ${state.level} of 4`;
  document.getElementById("charName").innerText = lvl.tutor;
  document.getElementById("charDialogue").innerText = lvl.dialogue;
  document.getElementById("charIcon").innerText = lvl.avatar;
  document.getElementById("roundtitle").innerText = lvl.title;
  document.getElementById("roundprompt").innerText = lvl.prompt;
  
  // Clear layout containers
  const viewport = document.getElementById("gameViewport");
  viewport.innerHTML = "";
  const opts = document.getElementById("opts");
  opts.innerHTML = "";
  document.getElementById("outcome").innerText = "";

  // Reset metrics temporarily
  state.stats.challenge = 0;
  state.stats.barrier = 0;
  state.stats.schema = 0;
  updateHUD();

  // Load level-specific UI
  if (state.level === 1) {
    buildLevel1(viewport, opts);
  } else if (state.level === 2) {
    buildLevel2(viewport, opts);
  } else if (state.level === 3) {
    buildLevel3(viewport, opts);
  } else if (state.level === 4) {
    buildLevel4(viewport, opts);
  }
}

// --------------------------------------------------------------------------
// LEVEL 1: NOETIC SOURCING AUDIT
// --------------------------------------------------------------------------
let activeZoneId = null;
const l1Sources = {
  zone1: {
    source: "Boston Merchant Petition (1765)",
    text: "Colonial merchants warn of severe trade disruptions, protesting the tax as an unconstitutional assault on commerce.",
    correct: "commercial opposition"
  },
  zone2: {
    source: "Stamp Act Congress Resolves",
    text: "Delegates argue that parliament cannot tax colonists who have no representatives. Crucial constitutional resistance.",
    correct: "legal protests"
  },
  zone3: {
    source: "Petition of Enslaved Colonists (Boston)",
    text: "Enslaved Bostonians petition the Governor, noting that fighting for freedom from Britain exposes the hypocrisy of keeping them in chains.",
    correct: "enslaved requests"
  }
};

function buildLevel1(viewport, opts) {
  const container = document.createElement("div");
  container.className = "l1-container";
  
  // Left side: AI text with bypass highlights
  const essay = document.createElement("div");
  essay.className = "essay-pane";
  essay.innerHTML = `
    <div class="essay-para">The Stamp Act was passed by Britain. In response, <span class="bypass-word" id="zone1" tabindex="0" role="button" onclick="selectZone('zone1')" onkeydown="handleKeySelect(event, selectZone, 'zone1')">[Bypass Zone: Unified Merchant Agreement]</span>.</div>
    <div class="essay-para">All colonials formed <span class="bypass-word" id="zone2" tabindex="0" role="button" onclick="selectZone('zone2')" onkeydown="handleKeySelect(event, selectZone, 'zone2')">[Bypass Zone: Simple Patriot Protest]</span>, and taxation was resolved cleanly.</div>
    <div class="essay-para">Furthermore, historical records show <span class="bypass-word" id="zone3" tabindex="0" role="button" onclick="selectZone('zone3')" onkeydown="handleKeySelect(event, selectZone, 'zone3')">[Bypass Zone: Forgotten Enslaved Stances]</span>, keeping the story centered on elites.</div>
  `;
  
  // Right side: original sources
  const sources = document.createElement("div");
  sources.className = "sources-pane";
  
  Object.keys(l1Sources).forEach(key => {
    const src = l1Sources[key];
    const card = document.createElement("div");
    card.className = "source-card";
    card.id = `card-${key}`;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.onclick = () => selectCard(key);
    card.onkeydown = (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); selectCard(key); } };
    card.innerHTML = `
      <span class="source-label">${src.source}</span>
      <span class="source-snippet">${src.text}</span>
    `;
    sources.appendChild(card);
  });

  container.appendChild(essay);
  container.appendChild(sources);
  viewport.appendChild(container);

  // Set initial level controls (Instruction text)
  opts.innerHTML = `<p style="font-size:0.85rem; color:var(--dim)">Click a red <span style="color:var(--bad)">Bypass Zone</span> in the document, then click the correct <span style="color:var(--accent)">Primary Source Card</span> to overlay it and resolve the automated bypass.</p>`;

  state.stats.challenge = 15;
  state.stats.barrier = 10;
  updateHUD();
}

function selectZone(zoneId) {
  if (document.getElementById(zoneId).classList.contains("resolved")) return;
  activeZoneId = zoneId;
  document.querySelectorAll(".bypass-word").forEach(z => z.classList.remove("selected"));
  document.getElementById(zoneId).classList.add("selected");
  playSliderTick(300);
}

function selectCard(cardKey) {
  if (!activeZoneId) {
    document.getElementById("outcome").innerText = "Select a red Bypass Zone in the text first!";
    document.getElementById("outcome").style.color = "var(--bad)";
    playFailureNoise();
    return;
  }

  if (activeZoneId === cardKey) {
    // Correct Match
    const zone = document.getElementById(activeZoneId);
    zone.innerText = l1Sources[cardKey].source;
    zone.className = "bypass-word resolved";
    
    const card = document.getElementById(`card-${cardKey}`);
    card.style.opacity = "0.4";
    card.style.pointerEvents = "none";
    card.classList.remove("active-drag");

    activeZoneId = null;
    document.getElementById("outcome").innerText = "Primary source integrated! Noetic friction updated.";
    document.getElementById("outcome").style.color = "var(--good)";

    state.stats.challenge += 22;
    state.stats.barrier -= 2;
    playSuccessArpeggio();
    updateHUD();

    // Check level win
    const unresolved = document.querySelectorAll(".bypass-word:not(.resolved)");
    if (unresolved.length === 0) {
      document.getElementById("outcome").innerText = "Calibration Complete! All source bypasses audited successfully.";
      state.stats.challenge = 75;
      state.stats.barrier = 5;
      updateHUD();
    }
  } else {
    document.getElementById("outcome").innerText = "This primary source does not complicate that specific bypass zone. Try again!";
    document.getElementById("outcome").style.color = "var(--bad)";
    playFailureNoise();
  }
}

// --------------------------------------------------------------------------
// LEVEL 2: RHETORICAL SOCRATIC TABLE
// --------------------------------------------------------------------------
const l2Choices = [
  {
    title: "1. AI Auto-Completion Move",
    desc: "Have the AI synthesize and write the peer responses automatically, so students don't need to debate.",
    challenge: 10,
    barrier: 5,
    rhetoricalSat: true,
    feedback: "Rhetorical Saturation! The dialogue is automated. Dialogue friction collapses to zero. Frictionless Bypass."
  },
  {
    title: "2. Peer Perspective Panels (CORE Openness)",
    desc: "Deploy classroom panels where peers use contrasting primary sources to cross-examine claims.",
    challenge: 65,
    barrier: 10,
    rhetoricalSat: false,
    feedback: "CORE Openness activated! Students must defend claims to other minds, keeping the dialogue friction productive."
  },
  {
    title: "3. AI Devil's Advocate (CORE Critical Thinking)",
    desc: "Calibrate the AI to act exclusively as a counter-claim mirror, forcing students to verify assertions.",
    challenge: 75,
    barrier: 12,
    rhetoricalSat: false,
    feedback: "CORE Critical Thinking integrated! The student uses AI as a challenger rather than an exit generator."
  },
  {
    title: "4. Static Textbook Delivery",
    desc: "Ban all interactive debate and tools, returning to silent individual textbook readings.",
    challenge: 30,
    barrier: 60,
    rhetoricalSat: false,
    feedback: "Exclusionary Blockade! You introduced massive mechanical reading barriers without any dialogic reasoning support."
  }
];

function buildLevel2(viewport, opts) {
  const container = document.createElement("div");
  container.className = "l2-container";

  // Socratic Table
  const table = document.createElement("div");
  table.className = "socratic-table";
  table.innerHTML = `<div class="table-center">Socratic Table</div>`;

  for (let i = 0; i < 6; i++) {
    const seat = document.createElement("div");
    seat.className = `seat seat-${i}`;
    seat.innerHTML = `<span class="unicode-icon" style="font-size: 1.2rem;">👤</span>`;
    table.appendChild(seat);
  }
  container.appendChild(table);

  // Chat/Dialogue feed
  const history = document.createElement("div");
  history.className = "dialogue-history";
  history.id = "l2History";
  history.innerHTML = `
    <div class="chat-bubble student"><strong>Student:</strong> Federalist No. 10 argues that large republics protect liberty.</div>
    <div class="chat-bubble peer"><strong>AI Chatbot:</strong> Exactly! That is a perfect and complete summary. No further explanation needed.</div>
  `;
  container.appendChild(history);
  viewport.appendChild(container);

  // Load choices in control panel
  const grid = document.createElement("div");
  grid.className = "choice-grid";
  
  l2Choices.forEach((ch, idx) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.onclick = () => selectL2Choice(idx);
    btn.innerHTML = `
      <h5>${ch.title}</h5>
      <p>${ch.desc}</p>
    `;
    grid.appendChild(btn);
  });
  opts.appendChild(grid);

  state.stats.challenge = 20;
  state.stats.barrier = 15;
  updateHUD();
}

function selectL2Choice(idx) {
  const ch = l2Choices[idx];
  document.querySelectorAll(".choice-btn").forEach(b => b.classList.remove("active"));
  event.currentTarget.classList.add("active");

  state.stats.challenge = ch.challenge;
  state.stats.barrier = ch.barrier;
  updateHUD();

  // Update table visuals
  const seats = document.querySelectorAll(".seat");
  seats.forEach(s => s.classList.remove("active"));
  
  const history = document.getElementById("l2History");
  if (ch.rhetoricalSat) {
    seats[0].classList.add("active");
    history.innerHTML = `
      <div class="chat-bubble student"><strong>Student:</strong> Federalist No. 10 argues that large republics protect liberty.</div>
      <div class="chat-bubble peer" style="border-color:var(--bad)"><strong>AI Auto-Peer:</strong> Correct! The large republic prevents factions. Essay complete. Good job.</div>
    `;
    playFailureNoise();
  } else if (ch.challenge >= 60) {
    seats[1].classList.add("active");
    seats[3].classList.add("active");
    seats[5].classList.add("active");
    history.innerHTML = `
      <div class="chat-bubble student"><strong>Student:</strong> Federalist No. 10 argues that large republics protect liberty.</div>
      <div class="chat-bubble peer"><strong>Peer Panel:</strong> But Patrick Henry argued that consolidated republics crush local assemblies. How does Madison counter that?</div>
    `;
    playSuccessArpeggio();
  } else {
    history.innerHTML = `
      <div class="chat-bubble student"><strong>Student:</strong> Federalist No. 10 argues that large republics protect liberty.</div>
      <div class="chat-bubble peer" style="color:var(--dim)">[Silence. Banned tools mean no discussion takes place.]</div>
    `;
    playFailureNoise();
  }

  document.getElementById("outcome").innerText = ch.feedback;
  document.getElementById("outcome").style.color = ch.challenge >= 60 ? "var(--good)" : "var(--bad)";
}

// --------------------------------------------------------------------------
// LEVEL 3: EXISTENTIAL CORROBORATION & STANCE
// --------------------------------------------------------------------------
const l3Revisions = [
  { text: "AI Auto-Generate Stance", challenge: 15, barrier: 5, feedback: "Frictionless Bypass! The AI signed for the student. Zero authorial accountability." },
  { text: "Revision Stance A: Faction-checks", challenge: 65, barrier: 10, feedback: "Embodied Accountability! The student logs why their claim was revised based on primary documents." },
  { text: "Revision Stance B: Localist Protection", challenge: 70, barrier: 8, feedback: "Embodied Accountability! The student commits to their own claim and signs it." }
];

function buildLevel3(viewport, opts) {
  const container = document.createElement("div");
  container.className = "l3-container";

  // Paper Sheet
  const paper = document.createElement("div");
  paper.className = "paper-sheet";
  paper.innerHTML = `
    <div class="paper-title">Letter to the Editor: Civil Rights</div>
    <div class="paper-para">Dear Editor, in analyzing Dr. King's Birmingham Letter, I contend that legal protest was necessary because <span class="blank-slot" id="blank1">[Select revision item below]</span>.</div>
    <div class="paper-para">I verified this claim against local newspaper reactions and revised my initial thesis accordingly.</div>
    <div class="signature-row">
      <div style="font-size:0.75rem; color:#4b5563">Author Commitment Signature:</div>
      <div class="sig-line">
        <input type="text" class="sig-input" id="sigVal" placeholder="Type name to commit" oninput="signAuthor()">
        <span>Human Accountable Claimant</span>
      </div>
    </div>
  `;
  container.appendChild(paper);

  // Revision drawer
  const revDrawer = document.createElement("div");
  revDrawer.className = "revision-log-drawer";
  revDrawer.innerHTML = `<div class="rev-header">Student Revision Log Timeline</div>`;
  
  const revList = document.createElement("div");
  revList.className = "rev-list";
  
  l3Revisions.forEach((rev, idx) => {
    if (idx === 0) return; // Hide first option from log list
    const rItem = document.createElement("div");
    rItem.className = "rev-item";
    rItem.tabIndex = 0;
    rItem.setAttribute("role", "button");
    rItem.innerText = `Claim v${idx + 1}: ${rev.text.split(":")[1]}`;
    rItem.onclick = () => selectL3Rev(idx, rItem);
    rItem.onkeydown = (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); selectL3Rev(idx, rItem); } };
    revList.appendChild(rItem);
  });
  
  revDrawer.appendChild(revList);
  container.appendChild(revDrawer);
  
  viewport.appendChild(container);

  // Action Buttons
  opts.innerHTML = `
    <div style="display:flex; gap:12px;">
      <button class="btn ghost" style="flex-grow:1" onclick="bypassL3()">Bypass Option: Let AI Auto-Sign</button>
      <button class="btn" style="flex-grow:1" onclick="focusSig()">Signature Pledge</button>
    </div>
  `;

  state.stats.challenge = 30;
  state.stats.barrier = 20;
  updateHUD();
}

function selectL3Rev(idx, elem) {
  document.querySelectorAll(".rev-item").forEach(r => r.classList.remove("active"));
  elem.classList.add("active");

  const ch = l3Revisions[idx];
  document.getElementById("blank1").innerText = ch.text.split(":")[1];
  
  state.stats.challenge = ch.challenge;
  state.stats.barrier = ch.barrier;
  updateHUD();
  
  playSliderTick(350);
  document.getElementById("outcome").innerText = "Revision history mapped. Document awaiting human signature.";
  document.getElementById("outcome").style.color = "var(--accent)";
}

function focusSig() {
  document.getElementById("sigVal").focus();
  playNotification(440, "sine", 0.08, 0.1);
}

function signAuthor() {
  const sig = document.getElementById("sigVal").value;
  if (sig.trim().length > 3) {
    if (state.stats.challenge < 40) {
      // Bypassed
      document.getElementById("outcome").innerText = "Signed, but the content remains automated. Integrity: LOW.";
      document.getElementById("outcome").style.color = "var(--bad)";
      return;
    }
    state.stats.challenge = 80;
    state.stats.barrier = 5;
    updateHUD();
    document.getElementById("outcome").innerText = "Signature committed! HEART Honesty and Accountability locked.";
    document.getElementById("outcome").style.color = "var(--good)";
    playSuccessArpeggio();
  }
}

function bypassL3() {
  const ch = l3Revisions[0];
  document.getElementById("blank1").innerText = "[AI Auto-Generated Essay]";
  document.getElementById("sigVal").value = "S.M.O.O.T.H. Engine";
  
  state.stats.challenge = ch.challenge;
  state.stats.barrier = ch.barrier;
  updateHUD();
  
  document.getElementById("outcome").innerText = ch.feedback;
  document.getElementById("outcome").style.color = "var(--bad)";
  playFailureNoise();
}

// --------------------------------------------------------------------------
// LEVEL 4: INFRASTRUCTURAL POLICY CALIBRATION
// --------------------------------------------------------------------------
let l4AssistVal = 50;
let l4StruggleVal = 50;

function buildLevel4(viewport, opts) {
  const container = document.createElement("div");
  container.className = "l4-container";

  // Profiles list
  studentProfiles.forEach((prof, idx) => {
    const card = document.createElement("div");
    card.className = `profile-card ${idx === currentProfileIdx ? 'active' : ''}`;
    card.id = `prof-${idx}`;
    card.innerHTML = `
      <div class="prof-header">
        <div class="prof-icon"><span class="unicode-icon" style="font-size: 1.2rem;">🎓</span></div>
        <span class="prof-name">${prof.name}</span>
      </div>
      <div class="prof-desc">${prof.desc}</div>
    `;
    container.appendChild(card);
  });
  viewport.appendChild(container);

  // Load sliders in controls panel
  opts.innerHTML = `
    <div class="slider-group">
      <label>ACCESS ASSISTIVE SCAFFOLDS (Translate / Speech-to-Text) <span id="assistVal">50%</span></label>
      <input type="range" class="range-input" id="assistInput" min="0" max="100" value="50" oninput="changeSliders()">
    </div>
    <div class="slider-group">
      <label>COGNITIVE STRUGGLE REQ. (Source Analysis / Defense) <span id="struggleVal">50%</span></label>
      <input type="range" class="range-input" id="struggleInput" min="0" max="100" value="50" oninput="changeSliders()">
    </div>
  `;

  // Change title of button
  document.getElementById("nextbtn").innerText = "CALIBRATE PROFILE &rarr;";

  l4AssistVal = 50;
  l4StruggleVal = 50;
  calibrateL4Metrics();
}

function changeSliders() {
  l4AssistVal = parseInt(document.getElementById("assistInput").value);
  l4StruggleVal = parseInt(document.getElementById("struggleInput").value);
  
  document.getElementById("assistVal").innerText = `${l4AssistVal}%`;
  document.getElementById("struggleVal").innerText = `${l4StruggleVal}%`;

  calibrateL4Metrics();
  playSliderTick(200 + l4AssistVal * 3);
}

function calibrateL4Metrics() {
  // Map sliders to game statistics
  // Challenge = Struggle requirement
  // Barrier = 100 - Access Assistive support
  state.stats.challenge = l4StruggleVal;
  state.stats.barrier = 100 - l4AssistVal;
  updateHUD();
}

function checkL4Calibration() {
  const target = studentProfiles[currentProfileIdx];
  const assist = l4AssistVal;
  const struggle = l4StruggleVal;

  // Margin of error: 10 points
  const assistCorrect = Math.abs(assist - target.targetAssist) <= 10;
  const struggleCorrect = Math.abs(struggle - target.targetStruggle) <= 10;

  if (assistCorrect && struggleCorrect) {
    document.getElementById("outcome").innerText = target.successMsg;
    document.getElementById("outcome").style.color = "var(--good)";
    playSuccessArpeggio();

    state.levelAnswers.push({ assist, struggle, profileIdx: currentProfileIdx });

    // Move to next profile or finish
    if (currentProfileIdx < studentProfiles.length - 1) {
      currentProfileIdx++;
      setTimeout(() => {
        // Load next profile
        document.querySelectorAll(".profile-card").forEach(c => c.classList.remove("active"));
        document.getElementById(`prof-${currentProfileIdx}`).classList.add("active");
        
        // Reset sliders
        document.getElementById("assistInput").value = 50;
        document.getElementById("struggleInput").value = 50;
        changeSliders();
        
        document.getElementById("outcome").innerText = `Calibrating ${studentProfiles[currentProfileIdx].name}...`;
        document.getElementById("outcome").style.color = "var(--accent)";
      }, 1500);
    } else {
      // Completed all profiles
      document.getElementById("nextbtn").innerText = "FINISH SIMULATION &rarr;";
      document.getElementById("nextbtn").onclick = () => finishGame();
    }
  } else {
    // Feedback hints
    let hint = "Uncalibrated: ";
    if (assist < target.targetAssist - 10) {
      hint += "Mechanical barriers are too high. Increase assistive support. ";
    } else if (assist > target.targetAssist + 10) {
      hint += "Over-assistance is enabling bypass. Reduce structural help. ";
    }
    if (struggle < target.targetStruggle - 10) {
      hint += "Cognitive challenge is too low. Increase critical task friction. ";
    } else if (struggle > target.targetStruggle + 10) {
      hint += "Struggle is excessive and leads to frustration. Lower demand. ";
    }
    document.getElementById("outcome").innerText = hint;
    document.getElementById("outcome").style.color = "var(--bad)";
    playFailureNoise();
  }
}

/* ==========================================================================
   GAME STEPS CONTROLS
   ========================================================================== */
function advance() {
  if (state.level === 4) {
    checkL4Calibration();
    return;
  }

  // Check if current level is calibrated correctly (win conditions)
  if (state.stats.schema === 100) {
    // Store score and move on
    state.levelAnswers.push({
      challenge: state.stats.challenge,
      barrier: state.stats.barrier
    });
    
    state.level++;
    go("gameScreen", levels[state.level].env);
    setTimeout(() => {
      loadLevel();
    }, 600);
  } else {
    document.getElementById("outcome").innerText = "Calibration rejected! Ensure the Schema Assembly reaches 100% before continuing.";
    document.getElementById("outcome").style.color = "var(--bad)";
    playFailureNoise();
  }
}

function finishGame() {
  // Calculate average stats across every recorded answer (Levels 1-3 plus one
  // entry per Level 4 profile), not a hardcoded count of 4.
  let totalChallenge = 0;
  let totalBarrier = 0;
  let barrierCount = 0;

  state.levelAnswers.forEach(ans => {
    if (ans.challenge !== undefined) {
      totalChallenge += ans.challenge;
      totalBarrier += ans.barrier;
      barrierCount++;
    } else {
      // Level 4 maps struggle to challenge, and 100-assist to barrier.
      // A profile whose calibrated target is LOW assist (e.g. the frictionless-
      // bypass student) is restricting AI generation, not raising an access
      // barrier — so it stays out of the accessibility mean.
      totalChallenge += ans.struggle;
      const profile = studentProfiles[ans.profileIdx];
      if (profile && profile.targetAssist >= 50) {
        totalBarrier += (100 - ans.assist);
        barrierCount++;
      }
    }
  });

  state.meanChallenge = Math.round(totalChallenge / state.levelAnswers.length);
  const meanAccess = Math.round(100 - (totalBarrier / barrierCount));
  state.meanAccessibility = meanAccess;

  if (state.meanChallenge >= 55 && state.meanChallenge <= 80 && meanAccess >= 75) {
    state.schemaIntegrity = "High (Optimal)";
    document.getElementById("endauth").innerText = "DESIGN CERTIFICATE: OPTIMAL FRICTION";
    document.getElementById("endauth").style.color = "var(--good)";
    document.getElementById("endmessage").innerText = "Congratulations, Architect! You successfully preserved critical historical struggle while optimizing accessibility pathways.";
  } else {
    state.schemaIntegrity = "Low (Miscalibrated)";
    document.getElementById("endauth").innerText = "DESIGN CERTIFICATE: MISCALIBRATED";
    document.getElementById("endauth").style.color = "var(--bad)";
    document.getElementById("endmessage").innerText = "Calibration incomplete. The learning environments were either frictionless bypass zones or exclusionary barriers.";
  }

  document.getElementById("endfid").innerText = `${state.meanChallenge}%`;
  document.getElementById("endreach").innerText = `${meanAccess}%`;
  document.getElementById("endauthor").innerText = state.schemaIntegrity;

  go("finaleScreen", "end");
  playSuccessArpeggio();
}

/* ==========================================================================
   ACADEMIC SANDBOX QUIZ LOGIC
   ========================================================================== */
function buildSandboxQuiz() {
  currentScenarioIdx = 0;
  sandboxScore = 0;
  answeredScenarios = 0;
  loadScenario();
}

function loadScenario() {
  const scen = scenarios[currentScenarioIdx];
  document.getElementById("sortcounter").innerText = `SCENARIO ${currentScenarioIdx + 1} OF 10`;
  document.getElementById("scenariotext").innerText = scen.text;
  
  const container = document.getElementById("phasebtns");
  container.innerHTML = "";
  document.getElementById("sortfeedback").innerText = "";
  document.getElementById("sortfeedback").classList.remove("active");
  document.getElementById("sortnext").style.display = "none";

  scen.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "phasebtn";
    btn.innerText = opt.text;
    btn.onclick = () => verifyScenarioAnswer(idx, btn);
    container.appendChild(btn);
  });
}

function verifyScenarioAnswer(idx, btn) {
  const scen = scenarios[currentScenarioIdx];
  const opt = scen.options[idx];

  // Disable all buttons in this scenario
  document.querySelectorAll(".phasebtn").forEach(b => b.disabled = true);

  const feedback = document.getElementById("sortfeedback");
  feedback.classList.add("active");
  feedback.innerText = opt.feedback;

  if (opt.correct) {
    btn.classList.add("correct");
    feedback.style.color = "var(--good)";
    sandboxScore++;
    playSuccessArpeggio();
  } else {
    btn.classList.add("incorrect");
    feedback.style.color = "var(--bad)";
    playFailureNoise();
    
    // Highlight correct button
    document.querySelectorAll(".phasebtn").forEach(b => {
      scen.options.forEach((o, oIdx) => {
        if (o.correct && b.innerText === o.text) {
          b.classList.add("correct");
        }
      });
    });
  }

  answeredScenarios++;
  document.getElementById("scorebar").innerText = `SCORE: ${sandboxScore} / ${answeredScenarios}`;
  document.getElementById("sortnext").style.display = "inline-block";
}

function nextScenario() {
  if (currentScenarioIdx < scenarios.length - 1) {
    currentScenarioIdx++;
    loadScenario();
  } else {
    // Finished Quiz
    document.getElementById("scenariotext").innerText = `Quiz Complete! You scored ${sandboxScore} out of 10. You have demonstrated a thorough understanding of the social studies pedagogical friction framework.`;
    document.getElementById("phasebtns").innerHTML = "";
    document.getElementById("sortfeedback").innerText = "Review the framework table above to reinforce these concepts in your classroom design.";
    document.getElementById("sortnext").style.display = "none";
  }
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
window.addEventListener("DOMContentLoaded", () => {
  // Canvas particle setup
  bgCanvas = document.getElementById("fx");
  particleEngine = new ParticleEngine(bgCanvas);
  particleEngine.init("title");
  startGameLoop();
});
