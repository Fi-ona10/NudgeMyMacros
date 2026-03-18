import { useState } from 'react'
import './App.css'

interface MacroSummary {
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  items: number
}

interface AnalysisResult {
  foodItems: string[]
  macros: MacroSummary
  nudge: string
}

function App() {
  const [image, setImage] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setPreview(base64)
      // Strip the data:image/jpeg;base64, prefix
      setImage(base64.split(',')[1])
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyse = async () => {
    if (!image) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('http://localhost:3001/api/meal/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🥗 NudgeMyMacros</h1>
        <p>Upload a meal photo and get instant nutrition insights</p>
      </header>

      <main className="main">
        {/* Upload Section */}
        <div className="card upload-card">
          <h2>📸 Upload Your Meal</h2>
          <label className="upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            {preview ? (
              <img src={preview} alt="Meal preview" className="preview-img" />
            ) : (
              <div className="upload-placeholder">
                <span>🍽️</span>
                <p>Click to upload a meal photo</p>
              </div>
            )}
          </label>

          <button
            onClick={handleAnalyse}
            disabled={!image || loading}
            className="analyse-btn"
          >
            {loading ? '⏳ Analysing...' : '🔍 Analyse My Meal'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="card error-card">
            <p>❌ {error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Food Items */}
            <div className="card">
              <h2>🍱 Detected Foods</h2>
              <div className="food-tags">
                {result.foodItems.map((item, i) => (
                  <span key={i} className="food-tag">{item}</span>
                ))}
              </div>
            </div>

            {/* Macros */}
            <div className="card">
              <h2>📊 Nutrition Breakdown</h2>
              <div className="macros-grid">
                <div className="macro-box calories">
                  <span className="macro-value">{result.macros.totalCalories}</span>
                  <span className="macro-label">Calories</span>
                </div>
                <div className="macro-box protein">
                  <span className="macro-value">{result.macros.totalProtein}g</span>
                  <span className="macro-label">Protein</span>
                </div>
                <div className="macro-box carbs">
                  <span className="macro-value">{result.macros.totalCarbs}g</span>
                  <span className="macro-label">Carbs</span>
                </div>
                <div className="macro-box fat">
                  <span className="macro-value">{result.macros.totalFat}g</span>
                  <span className="macro-label">Fat</span>
                </div>
              </div>
            </div>

            {/* Nudge */}
            <div className="card nudge-card">
              <h2>💬 Your Nutrition Nudge</h2>
              <p className="nudge-text">{result.nudge}</p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App
