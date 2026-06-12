import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Settings, History, Upload, Play, CheckCircle2, 
  AlertTriangle, Copy, Printer, FileText, Search, Cpu, 
  HelpCircle, CheckSquare, Edit, RefreshCw, X, ChevronRight, Save, Trash2
} from 'lucide-react';
import './App.css';

const API_BASE = 'http://localhost:8000';

function App() {
  // Config States
  const [syllabusText, setSyllabusText] = useState('');
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [examType, setExamType] = useState('Final Examination');
  const [totalMarks, setTotalMarks] = useState(100);
  const [difficulty, setDifficulty] = useState({ easy: 30, medium: 50, hard: 20 });
  const [marksDist, setMarksDist] = useState({ mcq: 20, short: 30, long: 50 });
  const [apiProvider, setApiProvider] = useState('demo');
  const [apiKey, setApiKey] = useState('');

  // UI States
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [currentPaperId, setCurrentPaperId] = useState(null);
  const [paperTitle, setPaperTitle] = useState('');

  // Execution States
  const [taskId, setTaskId] = useState(null);
  const [taskStatus, setTaskStatus] = useState('idle'); // idle, running, completed, failed
  const [agentsState, setAgentsState] = useState({
    'Document Agent': { status: 'idle', logs: [], output: null },
    'Syllabus Agent': { status: 'idle', logs: [], output: null },
    'Topic Extraction Agent': { status: 'idle', logs: [], output: null },
    'Question Generation Agent': { status: 'idle', logs: [], output: null },
    'Difficulty Validation Agent': { status: 'idle', logs: [], output: null },
    'Marks Distribution Agent': { status: 'idle', logs: [], output: null },
    'Paper Formatting Agent': { status: 'idle', logs: [], output: null }
  });
  
  const [logsList, setLogsList] = useState([]);
  const [finalPaperMarkdown, setFinalPaperMarkdown] = useState('');
  const [questionsList, setQuestionsList] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editForm, setEditForm] = useState({ text: '', marks: 5, options: [] });

  const consoleEndRef = useRef(null);

  // Load history on startup
  useEffect(() => {
    fetchHistory();
  }, []);

  // Auto-scroll logs terminal
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logsList]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/papers`);
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
      }
    } catch (err) {
      console.error('Error fetching papers history:', err);
    }
  };

  const loadPaper = async (paperId) => {
    try {
      const res = await fetch(`${API_BASE}/api/papers/${paperId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentPaperId(data.id);
        setPaperTitle(data.title);
        setFinalPaperMarkdown(data.content);
        setSubject(data.subject);
        setExamType(data.exam_type);
        setTotalMarks(data.total_marks);
        
        // Populate questions if available, otherwise clear
        // We'll generate a dummy questions list from Markdown if not saved as JSON
        // For simplicity, we just parsed the Markdown headers or show placeholder
        setQuestionsList([]);
        setShowHistory(false);
      }
    } catch (err) {
      console.error('Error loading paper details:', err);
    }
  };

  const deletePaper = async (e, paperId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this question paper?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/papers/${paperId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHistory();
        if (currentPaperId === paperId) {
          setCurrentPaperId(null);
          setFinalPaperMarkdown('');
        }
      }
    } catch (err) {
      console.error('Error deleting paper:', err);
    }
  };

  // Adjust sliders to ensure they sum to 100%
  const handleDifficultyChange = (key, value) => {
    const val = parseInt(value) || 0;
    const otherKeys = Object.keys(difficulty).filter(k => k !== key);
    const difference = 100 - (val + difficulty[otherKeys[0]] + difficulty[otherKeys[1]]);
    
    // Distribute difference between other sliders
    let adj1 = Math.round(difference / 2);
    let adj2 = difference - adj1;
    
    const next1 = Math.max(0, difficulty[otherKeys[0]] + adj1);
    const next2 = Math.max(0, difficulty[otherKeys[1]] + adj2);
    
    setDifficulty({
      ...difficulty,
      [key]: val,
      [otherKeys[0]]: next1,
      [otherKeys[1]]: next2
    });
  };

  const handleMarksDistChange = (key, value) => {
    const val = parseInt(value) || 0;
    const otherKeys = Object.keys(marksDist).filter(k => k !== key);
    const difference = 100 - (val + marksDist[otherKeys[0]] + marksDist[otherKeys[1]]);
    
    let adj1 = Math.round(difference / 2);
    let adj2 = difference - adj1;
    
    const next1 = Math.max(0, marksDist[otherKeys[0]] + adj1);
    const next2 = Math.max(0, marksDist[otherKeys[1]] + adj2);
    
    setMarksDist({
      ...marksDist,
      [key]: val,
      [otherKeys[0]]: next1,
      [otherKeys[1]]: next2
    });
  };

  const startGeneration = async () => {
    if (!syllabusText.trim()) {
      alert('Please provide some syllabus topics or notes first!');
      return;
    }

    setTaskStatus('running');
    setLogsList([{ timestamp: new Date().toLocaleTimeString(), text: 'Spawning workflow session...', prefix: 'SYSTEM' }]);
    setFinalPaperMarkdown('');
    setQuestionsList([]);
    setCurrentPaperId(null);

    // Reset agents status
    const resetAgents = {};
    Object.keys(agentsState).forEach(k => {
      resetAgents[k] = { status: 'idle', logs: [], output: null };
    });
    setAgentsState(resetAgents);

    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabus_text: syllabusText,
          subject,
          exam_type: examType,
          total_marks: totalMarks,
          difficulty,
          marks_dist: marksDist,
          api_provider: apiProvider,
          api_key: apiKey
        })
      });

      if (!res.ok) throw new Error('Failed to post request');
      const data = await res.json();
      setTaskId(data.task_id);
      
      // Start polling
      pollTask(data.task_id);
    } catch (err) {
      setTaskStatus('failed');
      setLogsList(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), text: `Generation failed: ${err.message}`, prefix: 'ERROR' }]);
    }
  };

  const pollTask = (id) => {
    let combinedLogsCount = 0;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/status/${id}`);
        if (!res.ok) throw new Error('Polling error');
        const data = await res.json();

        // Update agents state
        setAgentsState(data.agents);
        setTaskStatus(data.status);

        // Collect and sync logs chronologically
        const newLogs = [];
        Object.entries(data.agents).forEach(([agentName, state]) => {
          state.logs.forEach(logText => {
            newLogs.push({ agentName, logText });
          });
        });

        // Only add newer logs to the dashboard console
        if (newLogs.length > combinedLogsCount) {
          const added = newLogs.slice(combinedLogsCount);
          setLogsList(prev => [
            ...prev,
            ...added.map(l => ({
              timestamp: new Date().toLocaleTimeString(),
              prefix: l.agentName.split(' ')[0].toUpperCase(),
              text: l.logText
            }))
          ]);
          combinedLogsCount = newLogs.length;
        }

        if (data.status === 'completed') {
          clearInterval(interval);
          setFinalPaperMarkdown(data.final_paper);
          setQuestionsList(data.questions_list || []);
          setPaperTitle(`${data.subject} ${data.exam_type}`);
          if (data.db_id) setCurrentPaperId(data.db_id);
          fetchHistory(); // refresh history list
          setLogsList(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), text: 'Workflow completed successfully.', prefix: 'SYSTEM' }]);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setLogsList(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), text: `Agent engine error: ${data.error}`, prefix: 'ERROR' }]);
        }
      } catch (err) {
        clearInterval(interval);
        setTaskStatus('failed');
        setLogsList(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), text: `Network error: ${err.message}`, prefix: 'ERROR' }]);
      }
    }, 1000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setSyllabusText(evt.target.result);
      setLogsList(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), text: `Imported file: ${file.name}`, prefix: 'FILE' }]);
    };
    reader.readAsText(file);
  };

  // Inline question editing actions
  const openEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    setEditForm({
      text: q.text,
      marks: q.marks,
      options: q.options ? [...q.options] : []
    });
  };

  const saveQuestionEdit = (id) => {
    const updated = questionsList.map(q => {
      if (q.id === id) {
        return { ...q, text: editForm.text, marks: parseInt(editForm.marks) || 0, options: editForm.options };
      }
      return q;
    });
    setQuestionsList(updated);
    setEditingQuestionId(null);
    
    // Reconstruct the markdown immediately so user sees changes in preview sheet
    const newMd = reconstructMarkdown(subject, examType, totalMarks, updated);
    setFinalPaperMarkdown(newMd);
  };

  const reconstructMarkdown = (sub, exam, marks, list) => {
    let md = `# ${sub} Examination\n`;
    md += `**Course/Subject**: ${sub}\n`;
    md += `**Exam Type**: ${exam}\n`;
    md += `**Time Allowed**: 3 Hours\n`;
    md += `**Maximum Marks**: ${marks} Marks\n\n`;
    md += `---\n\n`;
    md += `### GENERAL INSTRUCTIONS:\n`;
    md += `1. All questions are compulsory.\n`;
    md += `2. Section A contains Multiple Choice Questions carrying 2 marks each.\n`;
    md += `3. Section B contains Short Answer Questions carrying 5 marks each.\n`;
    md += `4. Section C contains Long/Descriptive Questions carrying 10 marks each.\n`;
    md += `5. Use of calculators is subject to course-specific guidelines.\n\n`;
    md += `---\n\n`;

    const mcqs = list.filter(q => q.type === 'MCQ');
    md += `## SECTION A (Multiple Choice Questions)\n*Answer all questions. Select the correct option.*\n\n`;
    mcqs.forEach((q, idx) => {
      md += `**Q${idx + 1}. ${q.text}** [Marks: {q.marks}]\n`;
      if (q.options) {
        q.options.forEach((opt, optIdx) => {
          md += `  ${String.fromCharCode(65 + optIdx)}) ${opt}\n`;
        });
      }
      md += `\n`;
    });

    const shorts = list.filter(q => q.type === 'Short Answer');
    md += `\n## SECTION B (Short Answer Questions)\n*Answer all questions in 100-150 words.*\n\n`;
    shorts.forEach((q, idx) => {
      md += `**Q${mcqs.length + idx + 1}. ${q.text}** [Marks: ${q.marks}]\n\n`;
    });

    const longs = list.filter(q => q.type === 'Long Answer' || q.type === 'Descriptive');
    md += `\n## SECTION C (Long Answer / Descriptive Questions)\n*Answer all questions in 300-500 words. Show code/diagrams where applicable.*\n\n`;
    longs.forEach((q, idx) => {
      md += `**Q${mcqs.length + shorts.length + idx + 1}. ${q.text}** [Marks: ${q.marks}]\n\n`;
    });

    // Add Answer Key
    md += `\n---\n\n## ANSWER KEY (Faculty Reference)\n\n`;
    mcqs.forEach((q, idx) => {
      md += `**Q${idx + 1} Answer**: ${q.answer || 'A'}\n`;
    });

    return md;
  };

  const savePaperToDb = async () => {
    if (!currentPaperId) {
      alert('Generate a paper first or load from history!');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/papers/${currentPaperId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: paperTitle,
          content: finalPaperMarkdown
        })
      });

      if (res.ok) {
        alert('Question paper saved successfully!');
        fetchHistory();
      } else {
        alert('Failed to save paper.');
      }
    } catch (err) {
      console.error('Error saving paper:', err);
    }
  };

  const copyMarkdown = () => {
    navigator.clipboard.writeText(finalPaperMarkdown);
    alert('Markdown content copied to clipboard!');
  };

  const printPaper = () => {
    window.print();
  };

  // Node UI config
  const nodeIcons = {
    'Document Agent': <FileText size={18} />,
    'Syllabus Agent': <BookOpen size={18} />,
    'Topic Extraction Agent': <Search size={18} />,
    'Question Generation Agent': <Edit size={18} />,
    'Difficulty Validation Agent': <CheckSquare size={18} />,
    'Marks Distribution Agent': <Cpu size={18} />,
    'Paper Formatting Agent': <ChevronRight size={18} />
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="brand-section">
          <BookOpen className="brand-logo" size={26} />
          <h1 className="brand-title">Agentic AI Exam Generator</h1>
        </div>

        <div className="header-controls">
          <div className="mode-toggle">
            <button 
              className={`mode-btn ${apiProvider === 'demo' ? 'active' : ''}`}
              onClick={() => setApiProvider('demo')}
            >
              Demo Mode
            </button>
            <button 
              className={`mode-btn ${apiProvider !== 'demo' ? 'active' : ''}`}
              onClick={() => setApiProvider('openai')}
            >
              Live LLM Mode
            </button>
          </div>

          {apiProvider !== 'demo' && (
            <button className="btn-settings" onClick={() => setShowSettings(true)} title="API Settings">
              <Settings size={18} />
            </button>
          )}

          <button className="btn-settings" onClick={() => setShowHistory(true)} title="Past Papers History">
            <History size={18} />
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="dashboard-grid">
        
        {/* Left Config Panel */}
        <section className="config-sidebar glass-panel">
          <div>
            <h2 className="section-title">1. Content Source</h2>
            <div className="form-group" style={{ marginTop: '10px' }}>
              <label>Syllabus, Topics, or Class Notes</label>
              <textarea 
                className="form-textarea"
                placeholder="Paste notes, course outlines, or syllabus topics here..."
                value={syllabusText}
                onChange={(e) => setSyllabusText(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <Upload size={14} /> Import text file
                <input 
                  type="file" 
                  accept=".txt" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>

          <div>
            <h2 className="section-title">2. Configuration</h2>
            
            <div className="form-group" style={{ marginTop: '10px' }}>
              <label>Subject / Domain</label>
              <select className="form-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="Auto-Detect">Auto-Detect Domain</option>
                <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="Agentic AI & LLMs">Agentic AI & LLMs</option>
              </select>
            </div>

            <div className="form-group">
              <label>Examination Type</label>
              <select className="form-select" value={examType} onChange={(e) => setExamType(e.target.value)}>
                <option value="Quiz / Test 1">Quiz / Test 1</option>
                <option value="Midterm Examination">Midterm Examination</option>
                <option value="Final Examination">Final Examination</option>
              </select>
            </div>

            <div className="form-group">
              <label>Total Marks: <span style={{ color: 'var(--primary-hover)', fontWeight: 'bold' }}>{totalMarks}</span></label>
              <input 
                type="range" 
                min="30" 
                max="150" 
                step="5" 
                value={totalMarks} 
                onChange={(e) => setTotalMarks(parseInt(e.target.value))}
                style={{ accentColor: 'var(--primary)' }}
              />
            </div>
          </div>

          <div>
            <h2 className="section-title">3. Target Balance</h2>
            
            {/* Difficulty Sliders */}
            <div className="slider-container" style={{ marginTop: '10px', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 'bold' }}>DIFFICULTY RATIO (Sum: 100%)</div>
              
              <div className="form-group">
                <div className="slider-row">
                  <span>Easy</span>
                  <span className="slider-val">{difficulty.easy}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={difficulty.easy} 
                  onChange={(e) => handleDifficultyChange('easy', e.target.value)} 
                />
              </div>

              <div className="form-group">
                <div className="slider-row">
                  <span>Medium</span>
                  <span className="slider-val">{difficulty.medium}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={difficulty.medium} 
                  onChange={(e) => handleDifficultyChange('medium', e.target.value)} 
                />
              </div>

              <div className="form-group">
                <div className="slider-row">
                  <span>Hard</span>
                  <span className="slider-val">{difficulty.hard}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={difficulty.hard} 
                  onChange={(e) => handleDifficultyChange('hard', e.target.value)} 
                />
              </div>
            </div>

            {/* Marks Sliders */}
            <div className="slider-container">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 'bold' }}>MARKS WEIGHTAGE (Sum: 100%)</div>
              
              <div className="form-group">
                <div className="slider-row">
                  <span>MCQ (2 Marks)</span>
                  <span className="slider-val">{marksDist.mcq}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={marksDist.mcq} 
                  onChange={(e) => handleMarksDistChange('mcq', e.target.value)} 
                />
              </div>

              <div className="form-group">
                <div className="slider-row">
                  <span>Short Answer (5 Marks)</span>
                  <span className="slider-val">{marksDist.short}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={marksDist.short} 
                  onChange={(e) => handleMarksDistChange('short', e.target.value)} 
                />
              </div>

              <div className="form-group">
                <div className="slider-row">
                  <span>Long Answer (10 Marks)</span>
                  <span className="slider-val">{marksDist.long}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={marksDist.long} 
                  onChange={(e) => handleMarksDistChange('long', e.target.value)} 
                />
              </div>
            </div>
          </div>

          <button 
            className="btn-generate" 
            onClick={startGeneration}
            disabled={taskStatus === 'running'}
          >
            <Play size={16} /> 
            {taskStatus === 'running' ? 'Running Agents...' : 'Run Agentic Flow'}
          </button>
        </section>

        {/* Center Agent Visualizer */}
        <section className="workflow-canvas">
          
          <div className="nodes-container">
            {Object.entries(agentsState).map(([agentName, state], idx, arr) => (
              <React.Fragment key={agentName}>
                <div className="node-row">
                  <div 
                    className={`agent-node ${state.status}`}
                    onClick={() => setSelectedNode({ name: agentName, ...state })}
                  >
                    <div className="agent-icon">
                      {state.status === 'completed' ? <CheckCircle2 size={18} /> : nodeIcons[agentName]}
                    </div>
                    <div className="agent-info">
                      <span className="agent-name">{agentName}</span>
                      <span className="agent-status-label">{state.status}</span>
                    </div>
                    {state.status === 'running' && (
                      <span className="console-cursor" style={{ position: 'absolute', right: '16px' }} />
                    )}
                  </div>
                </div>
                {idx < arr.length - 1 && (
                  <div className={`flow-arrow-down ${state.status === 'completed' ? 'active' : ''}`}>
                    <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
                      <path d="M10 0V26M10 26L6 22M10 26L14 22" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Combined Logs Terminal */}
          <div className="logs-console">
            <div className="console-header">
              <div className="console-title">
                <Cpu size={14} style={{ color: '#10b981' }} />
                <span>Agent Activity Terminal</span>
              </div>
              <span className="console-title" style={{ fontSize: '0.75rem' }}>
                STATUS: <span style={{ color: taskStatus === 'running' ? '#60a5fa' : taskStatus === 'completed' ? '#10b981' : '#f59e0b' }}>{taskStatus.toUpperCase()}</span>
              </span>
            </div>
            <div className="console-body">
              {logsList.map((log, idx) => (
                <div className="console-log-line" key={idx}>
                  <span className="log-timestamp">[{log.timestamp}]</span>
                  <span className="log-prefix">{log.prefix}:</span>
                  <span>{log.text}</span>
                </div>
              ))}
              {taskStatus === 'running' && (
                <div className="console-log-line">
                  <span className="console-cursor" />
                </div>
              )}
              <div ref={consoleEndRef} />
            </div>
          </div>

          {/* Node Inspector Drawer */}
          {selectedNode && (
            <div className="inspector-drawer">
              <div className="inspector-header">
                <span className="inspector-title">{selectedNode.name} Inspector</span>
                <button className="btn-close" onClick={() => setSelectedNode(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="inspector-body">
                <div>
                  <h4 className="inspector-section-title">Agent Status</h4>
                  <p style={{ fontSize: '0.9rem', textTransform: 'capitalize', color: selectedNode.status === 'completed' ? 'var(--success)' : 'var(--text-main)' }}>
                    {selectedNode.status}
                  </p>
                </div>
                <div>
                  <h4 className="inspector-section-title">Intermediate Outputs</h4>
                  <pre className="inspector-block">
                    {selectedNode.output ? JSON.stringify(selectedNode.output, null, 2) : 'No output generated yet.'}
                  </pre>
                </div>
                <div>
                  <h4 className="inspector-section-title">Private Logs</h4>
                  <div className="inspector-block" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {selectedNode.logs.length > 0 ? selectedNode.logs.map((l, i) => <div key={i} style={{ marginBottom: '6px' }}>• {l}</div>) : 'No logs.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right Preview Panel */}
        <section className="preview-pane">
          <div className="preview-header">
            <span className="preview-title">Question Paper Preview</span>
            <div className="preview-actions">
              {currentPaperId && (
                <button className="btn-action" onClick={savePaperToDb} title="Save changes">
                  <Save size={14} /> Save
                </button>
              )}
              <button 
                className="btn-action" 
                onClick={copyMarkdown} 
                disabled={!finalPaperMarkdown}
                title="Copy Markdown"
              >
                <Copy size={14} /> Copy MD
              </button>
              <button 
                className="btn-action" 
                onClick={printPaper} 
                disabled={!finalPaperMarkdown}
                title="Print / Save PDF"
              >
                <Printer size={14} /> Export PDF
              </button>
            </div>
          </div>

          <div className="preview-body">
            {finalPaperMarkdown ? (
              <div className="paper-sheet">
                {questionsList.length > 0 ? (
                  // Interactive Render supporting inline editing
                  <div>
                    <h1>{subject} Examination</h1>
                    <h2>Exam Type: {examType}</h2>
                    <div className="paper-meta">
                      <span>Time Allowed: 3 Hours</span>
                      <span>Maximum Marks: {totalMarks} Marks</span>
                    </div>

                    <div className="paper-instructions">
                      <strong>GENERAL INSTRUCTIONS:</strong>
                      <ol>
                        <li>All questions are compulsory.</li>
                        <li>Section A contains Multiple Choice Questions (2 marks each).</li>
                        <li>Section B contains Short Answer Questions (5 marks each).</li>
                        <li>Section C contains Long Answer Questions (10 marks each).</li>
                      </ol>
                    </div>

                    <h3>SECTION A (Multiple Choice Questions)</h3>
                    {questionsList.filter(q => q.type === 'MCQ').map((q, idx) => (
                      <div className="paper-question-item" key={q.id}>
                        <div className="question-item-actions">
                          <button className="btn-q-action" onClick={() => openEditQuestion(q)} title="Edit Question">
                            <Edit size={12} />
                          </button>
                        </div>
                        {editingQuestionId === q.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input 
                              type="text" 
                              className="inline-editor" 
                              value={editForm.text} 
                              onChange={(e) => setEditForm({ ...editForm, text: e.target.value })} 
                            />
                            {editForm.options.map((opt, oIdx) => (
                              <input 
                                key={oIdx} 
                                type="text" 
                                className="inline-editor" 
                                style={{ marginLeft: '20px', width: '80%' }}
                                value={opt} 
                                onChange={(e) => {
                                  const updatedOpts = [...editForm.options];
                                  updatedOpts[oIdx] = e.target.value;
                                  setEditForm({ ...editForm, options: updatedOpts });
                                }} 
                              />
                            ))}
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => saveQuestionEdit(q.id)} style={{ padding: '2px 8px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px' }}>Done</button>
                              <button onClick={() => setEditingQuestionId(null)} style={{ padding: '2px 8px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px' }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="question-marks">[{q.marks} Marks]</span>
                            <span className="question-text">Q{idx + 1}. {q.text}</span>
                            <ul className="question-options">
                              {q.options && q.options.map((opt, oIdx) => (
                                <li key={oIdx}>{String.fromCharCode(65 + oIdx)}) {opt}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    ))}

                    <h3>SECTION B (Short Answer Questions)</h3>
                    {questionsList.filter(q => q.type === 'Short Answer').map((q, idx) => {
                      const mcqCount = questionsList.filter(qi => qi.type === 'MCQ').length;
                      return (
                        <div className="paper-question-item" key={q.id}>
                          <div className="question-item-actions">
                            <button className="btn-q-action" onClick={() => openEditQuestion(q)} title="Edit Question">
                              <Edit size={12} />
                            </button>
                          </div>
                          {editingQuestionId === q.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <input 
                                type="text" 
                                className="inline-editor" 
                                value={editForm.text} 
                                onChange={(e) => setEditForm({ ...editForm, text: e.target.value })} 
                              />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => saveQuestionEdit(q.id)} style={{ padding: '2px 8px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px' }}>Done</button>
                                <button onClick={() => setEditingQuestionId(null)} style={{ padding: '2px 8px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px' }}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="question-marks">[{q.marks} Marks]</span>
                              <span className="question-text">Q{mcqCount + idx + 1}. {q.text}</span>
                            </>
                          )}
                        </div>
                      );
                    })}

                    <h3>SECTION C (Long Answer / Descriptive Questions)</h3>
                    {questionsList.filter(q => q.type === 'Long Answer' || q.type === 'Descriptive').map((q, idx) => {
                      const mcqCount = questionsList.filter(qi => qi.type === 'MCQ').length;
                      const shortCount = questionsList.filter(qi => qi.type === 'Short Answer').length;
                      return (
                        <div className="paper-question-item" key={q.id}>
                          <div className="question-item-actions">
                            <button className="btn-q-action" onClick={() => openEditQuestion(q)} title="Edit Question">
                              <Edit size={12} />
                            </button>
                          </div>
                          {editingQuestionId === q.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <input 
                                type="text" 
                                className="inline-editor" 
                                value={editForm.text} 
                                onChange={(e) => setEditForm({ ...editForm, text: e.target.value })} 
                              />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => saveQuestionEdit(q.id)} style={{ padding: '2px 8px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px' }}>Done</button>
                                <button onClick={() => setEditingQuestionId(null)} style={{ padding: '2px 8px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px' }}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="question-marks">[{q.marks} Marks]</span>
                              <span className="question-text">Q{mcqCount + shortCount + idx + 1}. {q.text}</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Markdown-only Render fallback
                  <div style={{ whiteSpace: 'pre-wrap', fontStyle: 'normal' }}>
                    {finalPaperMarkdown}
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-placeholder">
                <FileText size={48} strokeWidth={1} />
                <p>Configure parameters on the left and run the agents to compile a new examination paper.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* API Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">API Configurations</span>
              <button className="btn-close" onClick={() => setShowSettings(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="api-settings-form">
                <div className="form-group">
                  <label>LLM Provider</label>
                  <select 
                    className="form-select" 
                    value={apiProvider} 
                    onChange={(e) => setApiProvider(e.target.value)}
                  >
                    <option value="gemini">Google Gemini AI</option>
                    <option value="openai">OpenAI GPT</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>API Key</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Enter your API key..." 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <button 
                  className="btn-generate" 
                  onClick={() => setShowSettings(false)}
                  style={{ marginTop: '12px' }}
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Generated Question Papers</span>
              <button className="btn-close" onClick={() => setShowHistory(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {historyList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {historyList.map(paper => (
                    <div 
                      key={paper.id} 
                      className="glass-panel" 
                      style={{ 
                        padding: '12px', 
                        display: 'flex', 
                        justifyContent: 'between', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.03)' 
                      }}
                      onClick={() => loadPaper(paper.id)}
                    >
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{paper.title}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Subject: {paper.subject} | Marks: {paper.total_marks} | Date: {new Date(paper.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => deletePaper(e, paper.id)} 
                        className="btn-q-action"
                        style={{ border: 'none', background: 'transparent', color: 'var(--danger)' }}
                        title="Delete paper"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No saved papers found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
