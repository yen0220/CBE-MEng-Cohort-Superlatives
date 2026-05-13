import React, { useEffect, useMemo, useState } from "react";

/*
  SETUP REQUIRED
  1. Create a Google Sheet.
  2. Open Extensions > Apps Script.
  3. Paste the Apps Script code provided in the chat.
  4. Deploy as Web App:
     - Execute as: Me
     - Who has access: Anyone
  5. Paste the deployed Web App URL below.
*/
const GOOGLE_SCRIPT_URL = "https://docs.google.com/spreadsheets/d/1OvhDvQ1xKkJN-iuiWfS7rbyC31FFGP60uTjh9WgI0oM/edit?gid=486070429#gid=486070429";

const rawCohort = [
  "Joanne",
  "Cheng",
  "Sharon",
  "Alex",
  "Harish",
  "Gwen",
  "Ali",
  "Bolin",
  "Evan",
  "Fiona",
  "Louis",
  "Shreya",
  "Julia",
  "Sreekar",
  "Kuba",
  "Hal",
  "Siddhant",
  "Mohamed",
  "Sabrina",
  "Benson",
  "Jiawei",
  "Joe",
  "Zipeng",
];

const cohort = [...rawCohort].sort((a, b) => a.localeCompare(b));

const categories = [
  {
    title: "Calmest under deadline pressure",
    kicker: "DEADLINE PRESSURE",
    subtitle: "When the deadline gets ugly, they somehow stay calm.",
  },
  {
    title: "Most likely to save the group project",
    kicker: "GROUP PROJECT HERO",
    subtitle: "If the project is sinking, everyone knows who steps in.",
  },
  {
    title: "Quietly gets everything done",
    kicker: "QUIET MVP",
    subtitle: "No fuss, no drama. Just consistently gets things done.",
  },
  {
    title: "Most reliable teammate",
    kicker: "RELIABLE TEAMMATE",
    subtitle: "If they said they would do it, it is already handled.",
  },
  {
    title: "Always prepared (even when no one else is)",
    kicker: "ALWAYS PREPARED",
    subtitle: "They probably brought the backup file, charger, and plan B.",
  },
  {
    title: "Best energy booster",
    kicker: "ENERGY BOOSTER",
    subtitle: "Their vibe alone lifts the room.",
  },
  {
    title: "Keeps it real",
    kicker: "KEEPS IT REAL",
    subtitle: "Honest, grounded, and exactly what the group needs.",
  },
  {
    title: "Future alumni hall-of-famer",
    kicker: "ALUMNI HALL OF FAME",
    subtitle: "Ten years from now, someone will say ‘I went to school with them.’",
  },
  {
    title: "Makes the code/math/model cleaner",
    kicker: "CLEANER THINKER",
    subtitle: "They make messy work look elegant.",
  },
  {
    title: "Always has a back-up plan",
    kicker: "BACK-UP PLAN",
    subtitle: "If plan A fails, they already have plan B and C.",
  },
  {
    title: "Best at turning chaos into a workflow",
    kicker: "CHAOS TO WORKFLOW",
    subtitle: "They can turn confusion into a system.",
  },
  {
    title: "Sees the big picture",
    kicker: "BIG PICTURE",
    subtitle: "They always understand what really matters.",
  },
  {
    title: "Most likely to ask “wait, when is this due?”",
    kicker: "WHEN IS THIS DUE",
    subtitle: "A classic last-minute but lovable energy.",
  },
  {
    title: "Most likely to ask ChatGPT before asking a human",
    kicker: "CHATGPT FIRST",
    subtitle: "Why ask a person when AI is one tab away?",
  },
  {
    title: "Most likely to trust AI (a little too much)",
    kicker: "TRUSTS AI TOO MUCH",
    subtitle: "Probably accepted the answer before verifying it.",
  },
  {
    title: "Most likely to know someone everywhere they go",
    kicker: "KNOWS SOMEONE EVERYWHERE",
    subtitle: "Everywhere they go, somehow they know a person there.",
  },
  {
    title: "Most likely to make everyone feel included",
    kicker: "MAKES EVERYONE FEEL INCLUDED",
    subtitle: "They make the group feel warmer and more welcoming.",
  },
  {
    title: "Most likely to drop the perfect one-liner",
    kicker: "PERFECT ONE-LINER",
    subtitle: "Their timing is elite.",
  },
  {
    title: "Most likely to keep it light when things get stressful",
    kicker: "KEEPS IT LIGHT",
    subtitle: "They make stressful moments feel manageable.",
  },
  {
    title: "Best “we’ve got this” energy",
    kicker: "WE HAVE GOT THIS ENERGY",
    subtitle: "You believe things will work out when they are around.",
  },
  {
    title: "Best listener, hands down",
    kicker: "BEST LISTENER",
    subtitle: "They listen carefully and make people feel heard.",
  },
];

function makeEmptyVotes(items) {
  return Object.fromEntries(items.map((item) => [item.title, []]));
}

function addVote(prevVotes, categoryTitle, person, maxSelections = 2) {
  const current = prevVotes[categoryTitle] || [];

  if (current.includes(person)) {
    return {
      ...prevVotes,
      [categoryTitle]: current.filter((name) => name !== person),
    };
  }

  if (current.length >= maxSelections) {
    return prevVotes;
  }

  return {
    ...prevVotes,
    [categoryTitle]: [...current, person],
  };
}

function initials(name) {
  return name.slice(0, 1).toUpperCase();
}

function makeVoteId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `vote_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function buildPayload(votes) {
  return {
    event: "CBE MEng Class of 2026 Cohort Superlatives",
    anonymous: true,
    voteId: makeVoteId(),
    clientSubmittedAt: new Date().toISOString(),
    votes,
  };
}

function runSelfTests() {
  const sorted = [...rawCohort].sort((a, b) => a.localeCompare(b));
  console.assert(
    JSON.stringify(sorted) === JSON.stringify(cohort),
    "Test failed: cohort should stay alphabetically sorted."
  );

  const testTitle = "Test";
  let votes = makeEmptyVotes([{ title: testTitle }]);
  votes = addVote(votes, testTitle, "Alex");
  votes = addVote(votes, testTitle, "Bolin");
  votes = addVote(votes, testTitle, "Cheng");

  console.assert(
    votes[testTitle].length === 2,
    "Test failed: each category should allow at most 2 selections."
  );
  console.assert(
    !votes[testTitle].includes("Cheng"),
    "Test failed: third selection should not be added."
  );

  votes = addVote(votes, testTitle, "Alex");
  console.assert(
    !votes[testTitle].includes("Alex"),
    "Test failed: clicking selected person should deselect."
  );

  const payload = buildPayload(makeEmptyVotes(categories));
  console.assert(payload.anonymous === true, "Test failed: payload should be marked anonymous.");
  console.assert(!payload.email && !payload.name, "Test failed: payload should not include voter name or email.");
  console.assert(categories.length === 21, "Test failed: expected 21 default categories.");
}

function PersonButton({ name, selected, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled && !selected}
      className={`person-button ${selected ? "selected" : ""} ${disabled && !selected ? "disabled" : ""}`}
    >
      <span className="person-initial">{initials(name)}</span>
      <span className="person-name">{name}</span>
    </button>
  );
}

function CategorySection({ item, index, selections, onToggle }) {
  const isFull = selections.length >= 2;

  return (
    <section className="category-section" id={`category-${index + 1}`}>
      <div className="category-header">
        <div className="category-kicker">
          {String(index + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")} · {item.kicker}
        </div>
        <p className="category-subtitle">{item.subtitle}</p>
        <div className="category-title-row">
          <div>
            <h2>{item.title}</h2>
            <p className="pick-note">Pick up to 2 people</p>
          </div>
          <div className="selected-count">{selections.length}/2</div>
        </div>
      </div>

      <div className="people-grid">
        {cohort.map((person) => (
          <PersonButton
            key={person}
            name={person}
            selected={selections.includes(person)}
            disabled={isFull}
            onClick={() => onToggle(item.title, person)}
          />
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [votes, setVotes] = useState(() => makeEmptyVotes(categories));
  const [submitState, setSubmitState] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    runSelfTests();
  }, []);

  const totalSelections = useMemo(() => {
    return Object.values(votes).reduce((sum, arr) => sum + arr.length, 0);
  }, [votes]);

  const completedCategories = useMemo(() => {
    return Object.values(votes).filter((arr) => arr.length > 0).length;
  }, [votes]);

  const progress = Math.round((completedCategories / categories.length) * 100);
  const endpointConfigured = GOOGLE_SCRIPT_URL.startsWith("https://script.google.com/");

  function toggleVote(categoryTitle, person) {
    setSubmitState("idle");
    setMessage("");
    setVotes((prev) => addVote(prev, categoryTitle, person));
  }

  function clearVotes() {
    setVotes(makeEmptyVotes(categories));
    setSubmitState("idle");
    setMessage("");
  }

  async function submitVotes() {
    if (!endpointConfigured) {
      setSubmitState("error");
      setMessage("Google Sheets endpoint is not configured yet. Paste your deployed Apps Script Web App URL into GOOGLE_SCRIPT_URL.");
      return;
    }

    if (totalSelections === 0) {
      setSubmitState("error");
      setMessage("Please select at least one person before submitting.");
      return;
    }

    setSubmitState("submitting");
    setMessage("Submitting your anonymous vote...");

    const payload = buildPayload(votes);

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      setSubmitState("success");
      setMessage("Your anonymous vote has been submitted. Thank you!");
    } catch (error) {
      setSubmitState("error");
      setMessage("Submission failed. Please check the Apps Script deployment URL and network connection.");
      console.error(error);
    }
  }

  return (
    <div className="app-shell">
      <style>{styles}</style>

      <header className="hero">
        <div className="hero-eyebrow">Cornell CBE MEng · Class of 2026</div>
        <h1>Cohort Superlatives for Graduation</h1>
        <p>
          Vote anonymously for the classmates who made this cohort memorable. Each category allows up to two selections.
        </p>
      </header>

      <div className="sticky-summary">
        <div className="summary-left">
          <div className="summary-title">Anonymous ballot</div>
          <div className="summary-meta">
            {completedCategories} / {categories.length} categories started · {totalSelections} total selections
          </div>
          <div className="progress-track" aria-label="Voting progress">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="summary-actions">
          <button type="button" className="secondary-button" onClick={clearVotes}>
            Clear
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={submitVotes}
            disabled={submitState === "submitting"}
          >
            {submitState === "submitting" ? "Submitting..." : "Submit anonymously"}
          </button>
        </div>
      </div>

      {!endpointConfigured && (
        <div className="setup-warning">
          Google Sheets is not connected yet. Replace <code>GOOGLE_SCRIPT_URL</code> with your deployed Apps Script Web App URL before sharing this site.
        </div>
      )}

      {message && (
        <div className={`status-message ${submitState}`}>
          {message}
        </div>
      )}

      <main className="ballot">
        {categories.map((item, index) => (
          <CategorySection
            key={item.title}
            item={item}
            index={index}
            selections={votes[item.title] || []}
            onToggle={toggleVote}
          />
        ))}
      </main>

      <footer className="footer-note">
        Names are displayed in alphabetical order. This ballot does not ask for voter name, email, or login.
      </footer>
    </div>
  );
}

const styles = `
  :root {
    --cornell-red: #B31B1B;
    --ivory: #fbf7ef;
    --ivory-2: #fffdf8;
    --cream: #f4ecdf;
    --warm-border: #e6d8c5;
    --warm-border-dark: #d8c5ad;
    --ink: #28231f;
    --muted: #756a60;
    --soft-red: #c76363;
    --soft-red-bg: #f8e9e7;
    --soft-red-bg-2: #fff3f1;
    --shadow: 0 18px 50px rgba(79, 52, 28, 0.08);
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: var(--ivory);
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }

  .app-shell {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(179, 27, 27, 0.07), transparent 34rem),
      linear-gradient(180deg, #fffdf8 0%, #fbf7ef 48%, #f6efe4 100%);
    color: var(--ink);
    padding: 40px 20px 56px;
  }

  .hero {
    max-width: 1120px;
    margin: 0 auto 22px;
    padding: 34px 34px 30px;
    border: 1px solid var(--warm-border);
    border-radius: 28px;
    background: rgba(255, 253, 248, 0.86);
    box-shadow: var(--shadow);
  }

  .hero-eyebrow {
    color: var(--cornell-red);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .hero h1 {
    margin: 12px 0 8px;
    font-size: clamp(32px, 5vw, 56px);
    line-height: 1.02;
    letter-spacing: -0.04em;
    font-weight: 750;
  }

  .hero p {
    max-width: 760px;
    margin: 0;
    color: var(--muted);
    font-size: 16px;
    line-height: 1.7;
  }

  .sticky-summary {
    position: sticky;
    top: 12px;
    z-index: 20;
    max-width: 1120px;
    margin: 0 auto 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 16px 18px;
    border: 1px solid rgba(230, 216, 197, 0.9);
    border-radius: 22px;
    background: rgba(255, 253, 248, 0.88);
    backdrop-filter: blur(16px);
    box-shadow: 0 12px 34px rgba(79, 52, 28, 0.06);
  }

  .summary-left {
    flex: 1;
    min-width: 240px;
  }

  .summary-title {
    font-weight: 750;
    font-size: 15px;
  }

  .summary-meta {
    margin-top: 3px;
    color: var(--muted);
    font-size: 13px;
  }

  .progress-track {
    height: 7px;
    margin-top: 10px;
    border-radius: 999px;
    overflow: hidden;
    background: #efe2d2;
  }

  .progress-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #cfa580, #b31b1b);
    transition: width 240ms ease;
  }

  .summary-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
  }

  .primary-button,
  .secondary-button {
    min-height: 42px;
    border-radius: 999px;
    padding: 10px 17px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, opacity 160ms ease;
    font-weight: 700;
    font-size: 14px;
  }

  .primary-button {
    background: var(--cornell-red);
    color: white;
    border-color: var(--cornell-red);
  }

  .primary-button:hover:not(:disabled) {
    background: #971717;
    transform: translateY(-1px);
  }

  .primary-button:disabled {
    opacity: 0.62;
    cursor: not-allowed;
  }

  .secondary-button {
    background: #fffdf8;
    color: var(--ink);
    border-color: var(--warm-border-dark);
  }

  .secondary-button:hover {
    background: #f8f0e6;
    transform: translateY(-1px);
  }

  .setup-warning,
  .status-message {
    max-width: 1120px;
    margin: 0 auto 16px;
    padding: 14px 16px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.6;
  }

  .setup-warning {
    border: 1px solid #ead2a1;
    background: #fff7df;
    color: #735016;
  }

  .setup-warning code {
    padding: 2px 6px;
    border-radius: 7px;
    background: rgba(255,255,255,0.62);
  }

  .status-message.idle,
  .status-message.submitting {
    border: 1px solid #dccab2;
    background: #fffaf0;
    color: #6f5b44;
  }

  .status-message.success {
    border: 1px solid #c8ddb9;
    background: #f4faef;
    color: #496c35;
  }

  .status-message.error {
    border: 1px solid #efc2bc;
    background: #fff0ee;
    color: #98463d;
  }

  .ballot {
    max-width: 1120px;
    margin: 0 auto;
    display: grid;
    gap: 18px;
  }

  .category-section {
    border: 1px solid var(--warm-border);
    border-radius: 26px;
    background: rgba(255, 253, 248, 0.94);
    box-shadow: 0 14px 40px rgba(79, 52, 28, 0.055);
    padding: 26px;
  }

  .category-header {
    margin-bottom: 20px;
  }

  .category-kicker {
    color: var(--cornell-red);
    font-size: 12px;
    font-weight: 850;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .category-subtitle {
    margin: 0 0 12px;
    color: #665b52;
    font-size: 16px;
    line-height: 1.65;
    font-style: italic;
  }

  .category-title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
  }

  .category-title-row h2 {
    margin: 0;
    font-size: clamp(22px, 3vw, 30px);
    line-height: 1.15;
    letter-spacing: -0.025em;
  }

  .pick-note {
    margin: 8px 0 0;
    color: var(--muted);
    font-size: 15px;
  }

  .selected-count {
    min-width: 54px;
    text-align: center;
    padding: 8px 10px;
    border-radius: 999px;
    border: 1px solid #ecd3cd;
    background: var(--soft-red-bg-2);
    color: var(--cornell-red);
    font-size: 13px;
    font-weight: 800;
  }

  .people-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 11px;
  }

  .person-button {
    display: flex;
    align-items: center;
    gap: 11px;
    min-height: 54px;
    border-radius: 16px;
    border: 1px solid #dfcfbc;
    background: #fffbf3;
    color: var(--ink);
    padding: 12px 14px;
    text-align: left;
    cursor: pointer;
    transition: transform 140ms ease, background 140ms ease, border-color 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
  }

  .person-button:hover:not(.disabled) {
    transform: translateY(-1px);
    border-color: #cfad8f;
    background: #ffffff;
    box-shadow: 0 8px 18px rgba(79, 52, 28, 0.07);
  }

  .person-button.selected {
    border-color: #d88e85;
    background: #fff1ee;
    box-shadow: 0 0 0 2px rgba(179, 27, 27, 0.08);
  }

  .person-button.disabled {
    opacity: 0.42;
    cursor: not-allowed;
  }

  .person-initial {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 29px;
    height: 29px;
    border-radius: 999px;
    background: var(--soft-red-bg);
    color: var(--soft-red);
    font-weight: 850;
    font-size: 13px;
  }

  .person-button.selected .person-initial {
    background: #e9c8c3;
    color: var(--cornell-red);
  }

  .person-name {
    font-size: 15px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .footer-note {
    max-width: 1120px;
    margin: 24px auto 0;
    color: var(--muted);
    font-size: 13px;
    text-align: center;
  }

  @media (max-width: 980px) {
    .people-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 720px) {
    .app-shell {
      padding: 22px 12px 40px;
    }

    .hero {
      padding: 26px 20px;
      border-radius: 24px;
    }

    .sticky-summary {
      position: static;
      flex-direction: column;
      align-items: stretch;
      border-radius: 20px;
    }

    .summary-actions {
      justify-content: stretch;
    }

    .primary-button,
    .secondary-button {
      flex: 1;
    }

    .category-section {
      padding: 20px;
      border-radius: 22px;
    }

    .category-title-row {
      flex-direction: column;
    }

    .people-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 440px) {
    .people-grid {
      grid-template-columns: 1fr;
    }
  }
`;
