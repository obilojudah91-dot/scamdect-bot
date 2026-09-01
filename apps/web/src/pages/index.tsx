import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Initialize Telegram WebApp when available
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      tg.ready()
      tg.expand()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Telegram Mini App</h1>
        <p className="text-gray-600 text-center mb-6">
          This Mini App is ready for future implementation.
        </p>
        <div className="space-y-3">
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition">
            Main Feature
          </button>
          <button className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition">
            History
          </button>
          <button className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition">
            Profile
          </button>
          <button className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition">
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}
