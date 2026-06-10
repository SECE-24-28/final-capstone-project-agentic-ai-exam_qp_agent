import { useState, useRef, useCallback } from "react";

const AGENT_STEPS = [
  { id: "analyze", label: "Content Analyzer", icon: "ti-file-search", desc: "Parsing syllabus & extracting topics" },
  { id: "plan", label: "Difficulty Planner", icon: "ti-chart-pie", desc: "Allocating questions across difficulty levels" },
  { id: "generate", label: "Question Generator", icon: "ti-bulb", desc: "Generating questions using Bloom's Taxonomy" },
  { id: "review", label: "Review Agent", icon: "ti-shield-check", desc: "Validating quality & removing duplicates" },
  { id: "format", label: "Formatting Agent", icon: "ti-layout", desc: "Structuring the final question paper" },
];

const DIFF_COLORS = { Easy: "#3B6D11", Medium: "#854F0B", Hard: "#A32D2D" };
const DIFF_BG = { Easy: "#EAF3DE", Medium: "#FAEEDA", Hard: "#FCEBEB" };

function Badge({ label, color, bg }) {
  return (
    <span style={{
      background: bg, color, fontSize: 11, fontWeight: 500,
      padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap"
    }}>{label}</span>
  );
}

function AgentProgress({ steps, currentStep, done }) {
  return (
    <div style={{ margin: "1.5rem 0" }}>
      {steps.map((step, i) => {
        const state = done ? "done" : i < currentStep ? "done" : i === currentStep ? "active" : "idle";
        return (
          <div key={step.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px", borderRadius: "var(--border-radius-md)",
            background: state === "active" ? "var(--color-background-info)" : "transparent",
            marginBottom: 4, transition: "background 0.3s"
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: state === "done" ? "#1D9E75" : state === "active" ? "#185FA5" : "var(--color-background-secondary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "0.5px solid var(--color-border-tertiary)", flexShrink: 0
            }}>
              {state === "done"
                ? <i className="ti ti-check" style={{ color: "#fff", fontSize: 13 }} />
                : state === "active"
                ? <i className={`ti ${step.icon}`} style={{ color: "#fff", fontSize: 13 }} />
                : <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontWeight: 500 }}>{i + 1}</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{step.label}</p>
              {state === "active" && (
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-info)" }}>{step.desc}</p>
              )}
            </div>
            {state === "active" && (
              <div style={{ display: "flex", gap: 3 }}>
                {[0, 1, 2].map(d => (
                  <div key={d} style={{
                    width: 5, height: 5, borderRadius: "50%", background: "#185FA5",
                    animation: `pulse 1.2s ease-in-out ${d * 0.2}s infinite`
                  }} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function QuestionCard({ q, idx, onEdit, editing, onSave, onCancel }) {
  const [text, setText] = useState(q.question);
  return (
    <div style={{
      background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", marginBottom: 10
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{
          minWidth: 24, height: 24, borderRadius: "50%",
          background: "var(--color-background-secondary)", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", flexShrink: 0, marginTop: 1
        }}>{idx + 1}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            <Badge label={q.difficulty} color={DIFF_COLORS[q.difficulty]} bg={DIFF_BG[q.difficulty]} />
            <Badge label={q.bloom} color="#3C3489" bg="#EEEDFE" />
            <Badge label={q.type} color="#5F5E5A" bg="#F1EFE8" />
            <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginLeft: "auto", whiteSpace: "nowrap" }}>
              {q.marks} mark{q.marks > 1 ? "s" : ""}
            </span>
          </div>
          {editing ? (
            <div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={3}
                style={{ width: "100%", fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
              />
              {q.options && (
                <div style={{ marginTop: 8 }}>
                  {q.options.map((opt, oi) => (
                    <p key={oi} style={{ margin: "2px 0", fontSize: 13, color: "var(--color-text-secondary)" }}>
                      {String.fromCharCode(65 + oi)}. {opt}
                    </p>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={() => onSave(text)} style={{ fontSize: 12 }}>Save</button>
                <button onClick={onCancel} style={{ fontSize: 12 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--color-text-primary)" }}>{q.question}</p>
              {q.options && (
                <div style={{ marginTop: 8 }}>
                  {q.options.map((opt, oi) => (
                    <p key={oi} style={{ margin: "2px 0", fontSize: 13, color: "var(--color-text-secondary)" }}>
                      {String.fromCharCode(65 + oi)}. {opt}
                    </p>
                  ))}
                </div>
              )}
              <button onClick={onEdit} style={{ fontSize: 12, marginTop: 8 }}>
                <i className="ti ti-edit" style={{ marginRight: 4, fontSize: 13 }} />Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState("config");
  const [syllabus, setSyllabus] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("3");
  const [totalMarks, setTotalMarks] = useState("100");
  const [easyPct, setEasyPct] = useState(30);
  const [medPct, setMedPct] = useState(40);
  const [hardPct, setHardPct] = useState(30);
  const [includeMCQ, setIncludeMCQ] = useState(true);
  const [includeShort, setIncludeShort] = useState(true);
  const [includeLong, setIncludeLong] = useState(true);
  const [includeDesc, setIncludeDesc] = useState(false);
  const [agentStep, setAgentStep] = useState(0);
  const [agentDone, setAgentDone] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [paperMeta, setPaperMeta] = useState(null);

  const intervalRef = useRef(null);

  const types = [
    includeMCQ && "MCQ",
    includeShort && "Short Answer",
    includeLong && "Long Answer",
    includeDesc && "Descriptive",
  ].filter(Boolean);

  const totalPct = easyPct + medPct + hardPct;

  function adjustDiff(which, val) {
    const num = Math.max(0, Math.min(100, Number(val)));
    if (which === "easy") {
      const rem = 100 - num;
      setEasyPct(num);
      const ratio = medPct / (medPct + hardPct) || 0.5;
      setMedPct(Math.round(rem * ratio));
      setHardPct(rem - Math.round(rem * ratio));
    } else if (which === "med") {
      const rem = 100 - num;
      setMedPct(num);
      const ratio = easyPct / (easyPct + hardPct) || 0.5;
      setEasyPct(Math.round(rem * ratio));
      setHardPct(rem - Math.round(rem * ratio));
    } else {
      const rem = 100 - num;
      setHardPct(num);
      const ratio = easyPct / (easyPct + medPct) || 0.5;
      setEasyPct(Math.round(rem * ratio));
      setMedPct(rem - Math.round(rem * ratio));
    }
  }

  async function generate() {
    if (!syllabus.trim()) { setError("Please enter syllabus or topics."); return; }
    if (!subject.trim()) { setError("Please enter a subject name."); return; }
    if (types.length === 0) { setError("Select at least one question type."); return; }
    setError("");
    setLoading(true);
    setStep("agents");
    setAgentStep(0);
    setAgentDone(false);

    let step = 0;
    intervalRef.current = setInterval(() => {
      step++;
      if (step < AGENT_STEPS.length) setAgentStep(step);
      else {
        clearInterval(intervalRef.current);
      }
    }, 1400);

    const prompt = `You are an expert exam paper generator. Generate a complete exam question paper.

Subject: ${subject}
Total Marks: ${totalMarks}
Duration: ${duration} hours
Syllabus/Topics: ${syllabus}
Question Types: ${types.join(", ")}
Difficulty Distribution: Easy ${easyPct}%, Medium ${medPct}%, Hard ${hardPct}%

Generate a well-balanced exam paper. Return ONLY valid JSON with this exact structure:
{
  "meta": {
    "subject": "${subject}",
    "totalMarks": ${totalMarks},
    "duration": "${duration} hours",
    "instructions": ["attempt all questions", "write clearly", "marks are indicated against each question"]
  },
  "sections": [
    {
      "name": "Section A - MCQ",
      "type": "MCQ",
      "questions": [
        {
          "question": "question text",
          "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"],
          "answer": "A",
          "difficulty": "Easy",
          "bloom": "Remember",
          "marks": 1,
          "type": "MCQ"
        }
      ]
    }
  ]
}

Include questions from all requested types: ${types.join(", ")}.
Distribute marks to sum to ${totalMarks}.
Bloom taxonomy levels: Remember, Understand, Apply, Analyze, Evaluate, Create.
Make questions directly relevant to the provided syllabus topics.
Generate at least 5 questions per section. Return only the JSON object, no markdown fences.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      clearInterval(intervalRef.current);
      setAgentDone(true);

      const allQ = parsed.sections.flatMap(sec =>
        (sec.questions || []).map(q => ({ ...q, section: sec.name }))
      );
      setQuestions(allQ);
      setPaperMeta(parsed.meta);

      setTimeout(() => setStep("paper"), 800);
    } catch (err) {
      clearInterval(intervalRef.current);
      setError("Failed to generate paper. Please try again.");
      setStep("config");
    } finally {
      setLoading(false);
    }
  }

  function saveEdit(idx, newText) {
    setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, question: newText } : q));
    setEditingIdx(null);
  }

  function exportPaper() {
    const sections = {};
    questions.forEach(q => {
      if (!sections[q.section]) sections[q.section] = [];
      sections[q.section].push(q);
    });

    let txt = `EXAMINATION QUESTION PAPER\n`;
    txt += `${"=".repeat(60)}\n`;
    txt += `Subject: ${paperMeta?.subject || subject}\n`;
    txt += `Total Marks: ${paperMeta?.totalMarks || totalMarks}\n`;
    txt += `Duration: ${paperMeta?.duration || duration + " hours"}\n\n`;
    txt += `INSTRUCTIONS:\n`;
    (paperMeta?.instructions || []).forEach((ins, i) => {
      txt += `${i + 1}. ${ins}\n`;
    });
    txt += `\n${"=".repeat(60)}\n\n`;

    Object.entries(sections).forEach(([sec, qs]) => {
      txt += `${sec.toUpperCase()}\n${"-".repeat(40)}\n`;
      qs.forEach((q, i) => {
        txt += `\nQ${i + 1}. [${q.difficulty} | ${q.marks} mark${q.marks > 1 ? "s" : ""}]\n`;
        txt += `${q.question}\n`;
        if (q.options) q.options.forEach(o => (txt += `  ${o}\n`));
      });
      txt += "\n";
    });

    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${subject.replace(/\s+/g, "_")}_exam_paper.txt`;
    a.click(); URL.revokeObjectURL(url);
  }

  const sectionNames = [...new Set(questions.map(q => q.section))];
  const totalGenMarks = questions.reduce((s, q) => s + (q.marks || 0), 0);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }
        .tab-btn { background:transparent; border:none; padding:6px 14px; cursor:pointer; font-size:13px; font-weight:500; color:var(--color-text-secondary); border-bottom:2px solid transparent; }
        .tab-btn.active { color:var(--color-text-primary); border-bottom-color:#185FA5; }
      `}</style>

      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "var(--border-radius-md)",
            background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <i className="ti ti-notes" style={{ color: "#185FA5", fontSize: 18 }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Exam paper generator</h1>
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>
              Agentic AI · Bloom's Taxonomy · Customizable distribution
            </p>
          </div>
        </div>
      </div>

      {step === "config" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Subject name</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Data Structures" style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Total marks</label>
                <input value={totalMarks} onChange={e => setTotalMarks(e.target.value)} type="number" min={10} max={200} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Duration (hrs)</label>
                <input value={duration} onChange={e => setDuration(e.target.value)} type="number" min={1} max={6} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>
              Syllabus / topics <span style={{ color: "var(--color-text-tertiary)" }}>(paste your syllabus, list topics, or describe the content)</span>
            </label>
            <textarea
              value={syllabus}
              onChange={e => setSyllabus(e.target.value)}
              rows={5}
              placeholder="e.g. Unit 1: Arrays, Linked Lists, Stacks, Queues&#10;Unit 2: Trees - Binary Trees, BST, AVL Trees&#10;Unit 3: Graphs - BFS, DFS, Shortest Path&#10;Unit 4: Sorting - Merge Sort, Quick Sort, Heap Sort&#10;Unit 5: Hashing and Dynamic Programming"
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div style={{
            background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)",
            padding: "1rem 1.25rem", marginBottom: 16
          }}>
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 500 }}>Difficulty distribution</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { label: "Easy", val: easyPct, set: v => adjustDiff("easy", v), color: "#3B6D11", bg: "#EAF3DE" },
                { label: "Medium", val: medPct, set: v => adjustDiff("med", v), color: "#854F0B", bg: "#FAEEDA" },
                { label: "Hard", val: hardPct, set: v => adjustDiff("hard", v), color: "#A32D2D", bg: "#FCEBEB" },
              ].map(d => (
                <div key={d.label} style={{ textAlign: "center" }}>
                  <div style={{
                    background: d.bg, borderRadius: "var(--border-radius-md)",
                    padding: "8px", marginBottom: 6
                  }}>
                    <span style={{ fontSize: 22, fontWeight: 500, color: d.color }}>{d.val}%</span>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: d.color }}>{d.label}</p>
                  </div>
                  <input type="range" min={0} max={100} step={5} value={d.val}
                    onChange={e => d.set(e.target.value)} style={{ width: "100%" }} />
                </div>
              ))}
            </div>
            {totalPct !== 100 && (
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--color-text-danger)" }}>
                ⚠ Distribution must sum to 100% (currently {totalPct}%)
              </p>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 500 }}>Question types</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "MCQ", val: includeMCQ, set: setIncludeMCQ },
                { label: "Short answer", val: includeShort, set: setIncludeShort },
                { label: "Long answer", val: includeLong, set: setIncludeLong },
                { label: "Descriptive", val: includeDesc, set: setIncludeDesc },
              ].map(t => (
                <button key={t.label} onClick={() => t.set(!t.val)} style={{
                  background: t.val ? "#E6F1FB" : "var(--color-background-secondary)",
                  color: t.val ? "#185FA5" : "var(--color-text-secondary)",
                  border: t.val ? "0.5px solid #185FA5" : "0.5px solid var(--color-border-tertiary)",
                  borderRadius: 20, padding: "6px 14px", fontSize: 13, cursor: "pointer"
                }}>
                  {t.val && <i className="ti ti-check" style={{ marginRight: 4, fontSize: 12 }} />}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p style={{ color: "var(--color-text-danger)", fontSize: 13, marginBottom: 12 }}>
              <i className="ti ti-alert-circle" style={{ marginRight: 4 }} />{error}
            </p>
          )}

          <button onClick={generate} disabled={loading || totalPct !== 100} style={{
            background: "#185FA5", color: "#fff", border: "none", padding: "10px 24px",
            borderRadius: "var(--border-radius-md)", fontSize: 14, fontWeight: 500, cursor: "pointer",
            opacity: (loading || totalPct !== 100) ? 0.6 : 1
          }}>
            <i className="ti ti-wand" style={{ marginRight: 8 }} />Generate question paper
          </button>
        </div>
      )}

      {step === "agents" && (
        <div>
          <div style={{
            background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)",
            padding: "1.25rem", marginBottom: 8
          }}>
            <p style={{ margin: "0 0 4px", fontWeight: 500 }}>Generating your paper…</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>
              {subject} · {totalMarks} marks · {duration}h · {types.join(", ")}
            </p>
          </div>
          <AgentProgress steps={AGENT_STEPS} currentStep={agentStep} done={agentDone} />
          {agentDone && (
            <p style={{ color: "#1D9E75", fontSize: 13, fontWeight: 500 }}>
              <i className="ti ti-circle-check" style={{ marginRight: 6 }} />All agents complete. Loading paper…
            </p>
          )}
        </div>
      )}

      {step === "paper" && questions.length > 0 && (
        <div>
          <div style={{
            background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)",
            padding: "1rem 1.25rem", marginBottom: 16,
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8
          }}>
            <div>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>{paperMeta?.subject || subject}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-text-secondary)" }}>
                {questions.length} questions · {totalGenMarks} marks · {paperMeta?.duration || duration + "h"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setStep("config")} style={{ fontSize: 13 }}>
                <i className="ti ti-refresh" style={{ marginRight: 4 }} />Regenerate
              </button>
              <button onClick={exportPaper} style={{
                background: "#185FA5", color: "#fff", border: "none",
                padding: "7px 16px", borderRadius: "var(--border-radius-md)", fontSize: 13, cursor: "pointer"
              }}>
                <i className="ti ti-download" style={{ marginRight: 4 }} />Export
              </button>
            </div>
          </div>

          {paperMeta?.instructions && (
            <div style={{
              background: "#EAF3DE", borderRadius: "var(--border-radius-md)",
              padding: "10px 14px", marginBottom: 16
            }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 500, color: "#3B6D11" }}>Instructions</p>
              {paperMeta.instructions.map((ins, i) => (
                <p key={i} style={{ margin: "2px 0", fontSize: 12, color: "#27500A" }}>{i + 1}. {ins}</p>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { label: "Easy", count: questions.filter(q => q.difficulty === "Easy").length, color: "#3B6D11", bg: "#EAF3DE" },
              { label: "Medium", count: questions.filter(q => q.difficulty === "Medium").length, color: "#854F0B", bg: "#FAEEDA" },
              { label: "Hard", count: questions.filter(q => q.difficulty === "Hard").length, color: "#A32D2D", bg: "#FCEBEB" },
            ].map(s => (
              <div key={s.label} style={{
                background: s.bg, borderRadius: "var(--border-radius-md)",
                padding: "8px 14px", display: "flex", alignItems: "center", gap: 8
              }}>
                <span style={{ fontSize: 18, fontWeight: 500, color: s.color }}>{s.count}</span>
                <span style={{ fontSize: 12, color: s.color }}>{s.label}</span>
              </div>
            ))}
          </div>

          <div style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: 16, display: "flex" }}>
            {sectionNames.map(sec => (
              <button key={sec} className="tab-btn active" style={{ fontSize: 12 }}>
                {sec}
              </button>
            ))}
          </div>

          {sectionNames.map(sec => (
            <div key={sec}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 10px" }}>
                {sec}
              </p>
              {questions
                .map((q, idx) => ({ q, idx }))
                .filter(({ q }) => q.section === sec)
                .map(({ q, idx }) => (
                  <QuestionCard
                    key={idx} q={q} idx={idx}
                    editing={editingIdx === idx}
                    onEdit={() => setEditingIdx(idx)}
                    onSave={text => saveEdit(idx, text)}
                    onCancel={() => setEditingIdx(null)}
                  />
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
