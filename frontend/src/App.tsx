import { useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function App() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file: File) => {
    setError(null)
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setProcessedImage(null)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleFile(file)
    } else {
      setError('Please drop an image file')
    }
  }, [])

  const removeBackground = async () => {
    if (!image) return
    setError(null)
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', image)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      const response = await fetch(`${API_URL}/remove-background`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'Accept': 'image/png',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to process image' }))
        throw new Error(errorData.detail || 'Failed to process image')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setProcessedImage(url)
    } catch (error: unknown) {
      console.error('Error removing background:', error)
      if (error instanceof Error && error.name === 'AbortError') {
        setError('Request timed out. The server is taking too long to respond. Please try again with a smaller image.')
      } else {
        setError(error instanceof Error ? error.message : 'Failed to process image')
      }
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement('a')
      link.href = processedImage
      link.download = 'processed-image.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div 
      className="min-h-screen bg-[#0D0D0D] text-white p-8"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-4">Photo<br />Background<br />Remover</h1>
            <p className="text-gray-400 text-lg">Upload or drop a file to remove<br />a background.</p>
          </div>

          <div className="flex flex-col w-full lg:w-[600px]">
            <div className={`mt-8 lg:mt-0 h-[400px] border-2 border-dashed rounded-lg ${isDragging ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-600'} transition-colors relative`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="file-upload"
              />
              
              {!preview && !processedImage && (
                <label 
                  htmlFor="file-upload" 
                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
                >
                  <div 
                    className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-full group-hover:bg-yellow-300 transition-colors mb-4"
                  >
                    Upload image
                  </div>
                  <p className="text-gray-400">or drop an image here</p>
                </label>
              )}

              {(preview || processedImage) && (
                <div className="absolute inset-0 p-4">
                  <div className="relative h-full">
                    <img 
                      src={processedImage || preview || ''} 
                      alt={processedImage ? "Processed" : "Preview"} 
                      className={`w-full h-full object-contain ${processedImage ? 'bg-[url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABDSURBVDiNY/z//z8DJYCJgUIw8AawIHN+//3N8OvPLwYmRiYGZiZmBhYWFgZGBkbSTUBXR7l3Rr1AuQEsuBLSgAMAQxAFGmpVa8AAAAAASUVORK5CYII=)] bg-repeat' : ''}`} 
                    />
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center mt-6">
              {preview && !loading && !processedImage && (
                <button
                  onClick={removeBackground}
                  className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-300 transition-colors"
                >
                  Remove Background
                </button>
              )}

              {processedImage && (
                <button
                  onClick={downloadImage}
                  className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-300 transition-colors"
                >
                  Download Image
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
