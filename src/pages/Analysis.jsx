import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const macros = [
  { label: 'Calories', value: '540 kcal', percent: 72, detail: 'On track' },
  { label: 'Protein', value: '32g', percent: 64, detail: 'Solid' },
  { label: 'Carbs', value: '48g', percent: 58, detail: 'Balanced' },
  { label: 'Fat', value: '18g', percent: 44, detail: 'Light' },
]

const defaultInsights = [
  'Higher protein at lunch supports steady energy through mid-afternoon.',
  'Fiber looks low today. Add a fruit or greens to improve satiety.',
  'Sodium is moderate. Stay hydrated if you are training later.',
]

const CLARIFAI_PROXY = '/api/clarifai'

// Detect production builds or native mobile app environments (where localhost:5173 host does not exist)
const isMobileOrProd = import.meta.env.PROD || !window.location.hostname.includes('localhost')

const GEMINI_ENDPOINT = isMobileOrProd
  ? `https://generativelanguage.googleapis.com/v1beta/models/${import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'}:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY || ''}`
  : '/api/gemini'

const USDA_ENDPOINT = isMobileOrProd
  ? `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${import.meta.env.VITE_USDA_API_KEY || ''}`
  : '/api/usda'

const toBase64 = (inputFile) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Failed to read image.'))
        return
      }

      const [, base64] = reader.result.split(',')
      resolve(base64)
    }

    reader.onerror = () => reject(new Error('Failed to read image.'))
    reader.readAsDataURL(inputFile)
  })

const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

function Analysis() {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [manualLabel, setManualLabel] = useState('')
  const [mealInsights, setMealInsights] = useState(defaultInsights)

  useEffect(() => {
    if (!previewUrl) return undefined

    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return
    setFile(nextFile)
    setPreviewUrl(URL.createObjectURL(nextFile))
    setAnalysis(null)
    setError('')
  }

  const clearUpload = () => {
     setFile(null)
     setPreviewUrl('')
     setAnalysis(null)
     setError('')
     setMealInsights(defaultInsights)
  }

  const buildAnalysis = ({ label, confidence, food, detection }) => {
    const nutrients = food?.foodNutrients || []
    const getValue = (name) => {
      const nutrient = nutrients.find((item) => item.nutrientName === name)
      return nutrient?.value
    }
    const sourceParts = [food?.dataType || 'USDA FoodData Central', detection]
    const timestamp = new Date().toISOString()

    setAnalysis({
      label,
      confidence,
      description: food?.description || label,
      calories: getValue('Energy'),
      protein: getValue('Protein'),
      carbs: getValue('Carbohydrate, by difference'),
      fat: getValue('Total lipid (fat)'),
      source: sourceParts.filter(Boolean).join(' · '),
      timestamp,
      imageUrl: previewUrl,
    })
  }

  const analyzeLabel = async (label, detection) => {
    const joiner = USDA_ENDPOINT.includes('?') ? '&' : '?'
    const usdaResponse = await fetch(
      `${USDA_ENDPOINT}${joiner}query=${encodeURIComponent(label)}&pageSize=1`
    )

    if (!usdaResponse.ok) {
      if (usdaResponse.status === 401 || usdaResponse.status === 403) {
        throw new Error('USDA API key is missing or invalid.')
      }
      throw new Error('Nutrition lookup failed. Try another image.')
    }

    const usdaData = await usdaResponse.json()
    const food = usdaData?.foods?.[0]

    if (!food) {
      buildAnalysis({ label, confidence: null, food: null, detection })
      throw new Error('USDA did not return a nutrition match for this label.')
    }

    buildAnalysis({ label, confidence: null, food, detection })
  }

  const analyzeMeal = async () => {
    if (!file) {
      setError('Upload a meal photo to analyze.')
      return
    }

    setLoading(true)
    setError('')
    setAnalysis(null)

    let base64Image
    try {
      base64Image = await toBase64(file)
    } catch (err) {
      setError(err?.message || 'Failed to process image file.')
      setLoading(false)
      return
    }

    let geminiFailed = false
    let geminiErrorMsg = ''

    if (import.meta.env.VITE_GEMINI_API_KEY) {
      try {
        const geminiResponse = await fetch(GEMINI_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert, precise nutritional science AI. Analyze this meal photo and determine its exact macronutrient and calorie count based on standard portions.
Return a valid, raw JSON object (with no markdown backticks or wrappers, just raw JSON) matching this schema:
{
  "label": "Name of the meal",
  "description": "Short appetizing description of the meal",
  "calories": 540,
  "protein": 32,
  "carbs": 48,
  "fat": 18,
  "confidence": 95,
  "notes": [
    "Insight 1 (e.g. Higher protein at lunch supports steady energy)",
    "Insight 2 (e.g. Fiber looks low today, add fruit)",
    "Insight 3 (e.g. Sodium is moderate, stay hydrated)"
  ]
}`
                  },
                  {
                    inlineData: {
                      mimeType: file.type || 'image/jpeg',
                      data: base64Image,
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          })
        })

        if (!geminiResponse.ok) {
          const statusText = geminiResponse.statusText || ''
          const rawErr = await geminiResponse.text()
          throw new Error(`Gemini API returned ${geminiResponse.status} ${statusText}: ${rawErr}`)
        }

        const data = await geminiResponse.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) {
          throw new Error('Empty response from Gemini API.')
        }

        const parsed = JSON.parse(text)
        const timestamp = new Date().toISOString()

        setAnalysis({
          label: parsed.label || 'Meal Photo',
          confidence: parsed.confidence || 95,
          description: parsed.description || parsed.label || 'Meal Photo',
          calories: parsed.calories,
          protein: parsed.protein,
          carbs: parsed.carbs,
          fat: parsed.fat,
          source: 'Google Gemini 2.0 Flash',
          timestamp,
          imageUrl: previewUrl,
        })

        if (parsed.notes && Array.isArray(parsed.notes)) {
          setMealInsights(parsed.notes)
        }
        
        setLoading(false)
        return // Successfully analyzed with Gemini!
      } catch (err) {
        console.warn('Gemini analysis failed, falling back to Clarifai/USDA...', err)
        geminiFailed = true
        geminiErrorMsg = err?.message || 'Gemini error'
      }
    }

    // Fallback: Clarifai + USDA flow
    try {
      const clarifaiResponse = await fetch(CLARIFAI_PROXY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: [
            {
              data: {
                image: {
                  base64: base64Image,
                },
              },
            },
          ],
        }),
      })

      if (!clarifaiResponse.ok) {
        const rawError = await clarifaiResponse.text()
        let message = 'Image analysis failed. Try again in a moment.'

        try {
          const parsed = JSON.parse(rawError)
          message = parsed?.status?.description || parsed?.status?.details || message
        } catch {
          if (rawError) {
            message = rawError
          }
        }

        if (clarifaiResponse.status === 401 || clarifaiResponse.status === 403) {
          message = 'Clarifai API key is missing or invalid.'
        }

        throw new Error(message)
      }

      const clarifaiData = await clarifaiResponse.json()
      const output = clarifaiData?.outputs?.[0]
      if (output?.status?.code && output.status.code !== 10000) {
        throw new Error(output.status.description || 'Clarifai analysis failed.')
      }

      const top = output?.data?.concepts?.[0]
      const label = top?.name
      const confidence = top?.value ? Math.round(top.value * 100) : null

      if (!label) {
        throw new Error('No food label returned from the model.')
      }

      await analyzeLabel(label, 'Clarifai Food Model')
      setAnalysis((prev) => (prev ? { ...prev, confidence } : prev))
    } catch (err) {
      let finalMsg = err?.message || 'Analysis failed.'
      if (geminiFailed) {
        if (geminiErrorMsg.includes('429') || geminiErrorMsg.toLowerCase().includes('quota') || geminiErrorMsg.toLowerCase().includes('rate limit')) {
          finalMsg = 'Gemini API limit reached. Clarifai key is also missing. You can type a food name below.'
        } else {
          finalMsg = `API Error: ${geminiErrorMsg}. Clarifai key is also missing. You can type a food name below.`
        }
      } else {
        const hint = /quota|rate limit|No food label/i.test(finalMsg)
          ? ' You can type a food name below.'
          : ''
        finalMsg = `${finalMsg}${hint}`
      }
      setError(finalMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleManualAnalyze = async () => {
    const label = manualLabel.trim()
    if (!label) {
      setError('Type a food name to analyze.')
      return
    }

    setLoading(true)
    setError('')
    setAnalysis(null)

    try {
      await analyzeLabel(label, 'Manual label')
    } catch (err) {
      setError(err?.message || 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  const addMealToDiary = () => {
    if (!analysis) return
    const userKey = user?.uid || 'guest'
    const currentDiary = JSON.parse(localStorage.getItem(`cal-ai-diary_${userKey}`) || '[]')
    const mealEntry = {
      id: Date.now(),
      name: analysis.description || analysis.label || 'Meal log',
      calories: Math.round(analysis.calories) || 0,
      protein: Math.round(analysis.protein) || 0,
      carbs: Math.round(analysis.carbs) || 0,
      fat: Math.round(analysis.fat) || 0,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
    currentDiary.unshift(mealEntry)
    localStorage.setItem(`cal-ai-diary_${userKey}`, JSON.stringify(currentDiary))

    // Update dynamic streak on logging meal!
    const todayStr = new Date().toDateString()
    const lastLoggedDate = localStorage.getItem(`cal-ai-streak-date_${userKey}`)
    if (lastLoggedDate !== todayStr) {
      const isCapacitor = !!window.Capacitor
      let currentStreak = parseInt(localStorage.getItem(`cal-ai-streak_${userKey}`) || (isCapacitor ? '12' : '0'), 10)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toDateString()

      if (lastLoggedDate === yesterdayStr) {
        currentStreak += 1
      } else {
        currentStreak = 1
      }

      localStorage.setItem(`cal-ai-streak_${userKey}`, currentStreak.toString())
      localStorage.setItem(`cal-ai-streak-date_${userKey}`, todayStr)
    }

    alert('Meal added to daily diary successfully!')
  }

  const macroData = analysis
    ? [
        {
          label: 'Calories',
          value: analysis.calories ? `${Math.round(analysis.calories)} kcal` : '—',
          percent: analysis.calories
            ? Math.min(100, Math.round((analysis.calories / 2000) * 100))
            : 0,
          detail: 'From analysis',
        },
        {
          label: 'Protein',
          value: analysis.protein ? `${Math.round(analysis.protein)}g` : '—',
          percent: analysis.protein
            ? Math.min(100, Math.round((analysis.protein / 120) * 100))
            : 0,
          detail: 'Daily goal',
        },
        {
          label: 'Carbs',
          value: analysis.carbs ? `${Math.round(analysis.carbs)}g` : '—',
          percent: analysis.carbs
            ? Math.min(100, Math.round((analysis.carbs / 250) * 100))
            : 0,
          detail: 'Daily goal',
        },
        {
          label: 'Fat',
          value: analysis.fat ? `${Math.round(analysis.fat)}g` : '—',
          percent: analysis.fat
            ? Math.min(100, Math.round((analysis.fat / 70) * 100))
            : 0,
          detail: 'Daily goal',
        },
      ]
    : macros

  return (
    <section className="page-stack">
      <div className="page-header">
        <div className="eyebrow">Research-backed analysis</div>
        <h1>Clear nutrition output you can act on.</h1>
        <p>
          Cal AI blends image recognition with verified nutrition sources to
          create a summary you can trust and share.
        </p>
        <div className="pill-row">
          <span className="pill">USDA data</span>
          <span className="pill">Portion confidence 92%</span>
          <span className="pill">Coach ready</span>
        </div>
      </div>

      <div className="card upload-card">
        <div className="card-head">
          <div>
            <h3>Analyze a meal photo</h3>
            <p>Real-time food recognition with free APIs.</p>
          </div>
          <span className="chip">Live</span>
        </div>
        <div className="upload-body">
          <label className="upload-drop">
            <input
              className="upload-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div>
              <strong>Upload a meal image</strong>
              <span>JPG or PNG, under 5MB</span>
            </div>
          </label>
          {previewUrl ? (
            <div className="upload-preview">
              <img src={previewUrl} alt="Meal preview" />
            </div>
          ) : (
            <div className="upload-empty">Preview will appear here.</div>
          )}
        </div>
        <div className="upload-actions">
          <button
            className="primary-btn"
            type="button"
            onClick={analyzeMeal}
            disabled={loading || !file}
          >
            {loading ? 'Analyzing...' : 'Analyze meal'}
          </button>
          <button className="ghost-btn" type="button" onClick={clearUpload}>
            Clear
          </button>
          <span className="upload-hint">Clarifai + USDA keys required in .env</span>
        </div>
        <div className="manual-row">
          <div className="manual-field">
            <label htmlFor="manualFood">Or type a food name</label>
            <input
              id="manualFood"
              className="manual-input"
              value={manualLabel}
              onChange={(event) => setManualLabel(event.target.value)}
              placeholder="e.g., pesto pasta"
            />
          </div>
          <button
            className="ghost-btn"
            type="button"
            onClick={handleManualAnalyze}
            disabled={loading || !manualLabel.trim()}
          >
            Analyze label
          </button>
        </div>
        <p className="manual-note">
          Use the manual label if the API is rate-limited or returns no label.
        </p>
        {error ? <div className="auth-error">{error}</div> : null}
        {analysis ? (
          <div className="analysis-result">
            <div className="analysis-meta">
              <div>
                <span>Detected food</span>
                <strong>{analysis.description}</strong>
              </div>
              <div>
                <span>Confidence</span>
                <strong>
                  {analysis.confidence ? `${analysis.confidence}%` : '—'}
                </strong>
              </div>
              <div>
                <span>Source</span>
                <strong>{analysis.source}</strong>
              </div>
            </div>
            <div className="result-grid">
              <div className="result-item">
                <span>Calories</span>
                <strong>
                  {analysis.calories ? `${analysis.calories} kcal` : '—'}
                </strong>
              </div>
              <div className="result-item">
                <span>Protein</span>
                <strong>
                  {analysis.protein ? `${analysis.protein} g` : '—'}
                </strong>
              </div>
              <div className="result-item">
                <span>Carbs</span>
                <strong>{analysis.carbs ? `${analysis.carbs} g` : '—'}</strong>
              </div>
              <div className="result-item">
                <span>Fat</span>
                <strong>{analysis.fat ? `${analysis.fat} g` : '—'}</strong>
              </div>
            </div>
            <button className="primary-btn" type="button" onClick={addMealToDiary} style={{ marginTop: '14px', width: '100%', justifyContent: 'center' }}>
              📝 Add this Meal to Daily Diary
            </button>
          </div>
        ) : null}
      </div>

      <div className="analysis-grid">
        <div className="card highlight">
          <div className="card-head">
            <div>
              <h3>Meal snapshot</h3>
              <p>{analysis?.description || 'Grilled salmon bowl with quinoa and greens'}</p>
            </div>
            <span className="chip">Lunch</span>
          </div>
          <div className="snapshot">
            <div
              className={`snapshot-photo${analysis?.imageUrl ? ' has-image' : ''}`}
            >
              {analysis?.imageUrl ? (
                <img src={analysis.imageUrl} alt="Meal" />
              ) : (
                'Meal photo'
              )}
            </div>
            <div className="snapshot-meta">
              <div>
                <span>Total estimate</span>
                <strong>
                  {analysis?.calories
                    ? `${Math.round(analysis.calories)} kcal`
                    : '540 kcal'}
                </strong>
              </div>
              <div>
                <span>Confidence</span>
                <strong>{analysis?.confidence ? `${analysis.confidence}%` : '—'}</strong>
              </div>
              <div>
                <span>Time</span>
                <strong>
                  {analysis?.timestamp ? formatTime(analysis.timestamp) : '12:24 PM'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Macro breakdown</h3>
          <div className="macro-bars">
            {macroData.map((macro) => (
              <div key={macro.label} className="macro-bar">
                <div className="macro-top">
                  <span>{macro.label}</span>
                  <strong>{macro.value}</strong>
                </div>
                <div className="bar">
                  <span style={{ width: `${macro.percent}%` }}></span>
                </div>
                <div className="macro-foot">{macro.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="split">
        <div className="card">
          <h3>Research notes</h3>
          <ul className="insight-list">
            {mealInsights.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <div className="source-row">
            <span>Sources:</span>
            <span>USDA FoodData Central</span>
            <span>NIH macro guidance</span>
          </div>
        </div>
        <div className="card">
          <h3>Weekly trend</h3>
          <p>Calories stay within goal 5 of the last 7 days.</p>
          <div className="trend">
            <div className="trend-bar" style={{ height: '62%' }}></div>
            <div className="trend-bar" style={{ height: '75%' }}></div>
            <div className="trend-bar" style={{ height: '58%' }}></div>
            <div className="trend-bar" style={{ height: '80%' }}></div>
            <div className="trend-bar" style={{ height: '68%' }}></div>
            <div className="trend-bar" style={{ height: '74%' }}></div>
            <div className="trend-bar" style={{ height: '61%' }}></div>
          </div>
          <div className="trend-labels">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </div>

      <div className="page-actions">
        <Link className="ghost-btn" to="/">
          Back to login
        </Link>
        <Link className="primary-btn" to="/interactive">
          Go interactive
        </Link>
      </div>
    </section>
  )
}

export default Analysis
