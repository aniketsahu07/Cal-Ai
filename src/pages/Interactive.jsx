import { useState } from 'react'
import { Link } from 'react-router-dom'

const initialMessages = [
  {
    from: 'assistant',
    text: 'Want a lighter dinner to balance lunch? I can suggest options under 450 kcal.',
  },
  {
    from: 'user',
    text: 'Yes, something high-protein with minimal prep.',
  },
  {
    from: 'assistant',
    text: 'Try Greek yogurt + berries and a handful of almonds. It lands at 420 kcal with 30g protein.',
  },
]

const tasks = [
  { title: 'Plan dinner', value: '7:30 PM', status: 'Scheduled' },
  { title: 'Hydration check', value: '1.4L', status: 'On track' },
  { title: 'Steps target', value: '6,800', status: '2k to go' },
]

const isMobileOrProd = import.meta.env.PROD || !window.location.hostname.includes('localhost')

const GEMINI_ENDPOINT = isMobileOrProd
  ? `https://generativelanguage.googleapis.com/v1beta/models/${import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'}:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY || ''}`
  : '/api/gemini'

function Interactive() {
  const [chatMessages, setChatMessages] = useState(initialMessages)
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault()
    const text = inputText.trim()
    if (!text || loading) return

    const newMessages = [...chatMessages, { from: 'user', text }]
    setChatMessages(newMessages)
    setInputText('')
    setLoading(true)

    const fallbackResponse = "I hear you! To get personalized calorie and diet advice from Cal AI, please configure your Gemini API key in the environment variables."

    if (import.meta.env.VITE_GEMINI_API_KEY) {
      try {
        const contents = newMessages.map(msg => ({
          role: msg.from === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }))

        const response = await fetch(GEMINI_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: "You are Cal AI, a premium, friendly, and expert calorie tracking and nutritional assistant. Give concise, actionable, and scientific advice about nutrition, meal prep, fitness, and health." }]
            }
          })
        })

        if (!response.ok) {
          throw new Error('Gemini API returned an error.')
        }

        const data = await response.json()
        const assistantText = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (assistantText) {
          setChatMessages(prev => [...prev, { from: 'assistant', text: assistantText }])
        } else {
          throw new Error('Empty response.')
        }
      } catch (err) {
        console.error('Gemini chat error:', err)
        setChatMessages(prev => [...prev, { from: 'assistant', text: "Apologies, I encountered an issue connecting to the AI brain. Let me know if you want to try again!" }])
      } finally {
        setLoading(false)
      }
    } else {
      setTimeout(() => {
        setChatMessages(prev => [...prev, { from: 'assistant', text: fallbackResponse }])
        setLoading(false)
      }, 800)
    }
  }

  const triggerFilter = (filterName) => {
    setInputText(`Suggest some ${filterName.toLowerCase()} meal options.`)
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div className="eyebrow">Interactive mode</div>
        <h1>Guide the day with quick, human feedback.</h1>
        <p>
          Ask questions, adjust your plan, and keep your goals visible without
          opening five different apps.
        </p>
      </div>

      <div className="interactive-grid">
        <div className="card chat">
          <div className="card-head">
            <div>
              <h3>Ask Cal AI</h3>
              <p>Human tone, fast answers.</p>
            </div>
            <span className="chip">Live</span>
          </div>
          <div className="chat-window" style={{ maxHeight: '400px', overflowY: 'auto', display: 'grid', gap: '12px', paddingBottom: '12px' }}>
            {chatMessages.map((msg, index) => (
              <div key={index} className={`bubble ${msg.from}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="bubble assistant" style={{ fontStyle: 'italic', color: 'var(--muted)' }}>
                Cal AI is thinking...
              </div>
            )}
          </div>
          <form className="chat-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '14px',
                color: 'var(--ink)'
              }}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your question..."
              disabled={loading}
            />
            <button className="primary-btn" type="submit" disabled={loading || !inputText.trim()} style={{ padding: '6px 16px', fontSize: '13px' }}>
              Send
            </button>
          </form>
        </div>

        <div className="stack">
          <div className="card">
            <h3>Today at a glance</h3>
            <div className="task-list">
              {tasks.map((task) => (
                <div key={task.title} className="task">
                  <div>
                    <strong>{task.title}</strong>
                    <span>{task.value}</span>
                  </div>
                  <span className="chip muted">{task.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3>Smart filters</h3>
            <p>Tap to narrow recommendations instantly.</p>
            <div className="filter-row">
              <button className="ghost-btn" type="button" onClick={() => triggerFilter('High protein')}>
                High protein
              </button>
              <button className="ghost-btn" type="button" onClick={() => triggerFilter('10 min prep')}>
                10 min prep
              </button>
              <button className="ghost-btn" type="button" onClick={() => triggerFilter('Dairy free')}>
                Dairy free
              </button>
            </div>
            <div className="filter-row">
              <button className="ghost-btn" type="button" onClick={() => triggerFilter('Budget friendly')}>
                Budget friendly
              </button>
              <button className="ghost-btn" type="button" onClick={() => triggerFilter('Post workout')}>
                Post workout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card action-card">
        <div>
          <h3>Interactive plan</h3>
          <p>
            Cal AI keeps your plan flexible. Swap a meal, adjust your macro
            target, and share the update with your coach instantly.
          </p>
        </div>
        <button className="primary-btn" type="button">
          Build tomorrow
        </button>
      </div>

      <div className="page-actions">
        <Link className="ghost-btn" to="/analysis">
          Back to analysis
        </Link>
        <Link className="link-btn" to="/">
          Return to login
        </Link>
      </div>
    </section>
  )
}

export default Interactive
