import { Link } from 'react-router-dom'

const messages = [
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

function Interactive() {
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
          <div className="chat-window">
            {messages.map((msg) => (
              <div key={msg.text} className={`bubble ${msg.from}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <span>Type your question...</span>
            <button className="primary-btn" type="button">
              Send
            </button>
          </div>
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
              <button className="ghost-btn" type="button">
                High protein
              </button>
              <button className="ghost-btn" type="button">
                10 min prep
              </button>
              <button className="ghost-btn" type="button">
                Dairy free
              </button>
            </div>
            <div className="filter-row">
              <button className="ghost-btn" type="button">
                Budget friendly
              </button>
              <button className="ghost-btn" type="button">
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
