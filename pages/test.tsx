export default function TestPage() {
  return (
    <div style={{ backgroundColor: 'red', padding: '20px' }}>
      <h1 style={{ color: 'white' }}>CSS Test Page</h1>
      <p style={{ color: 'white' }}>If you see red background, inline styles work</p>
      <div className="bg-blue-500 text-white p-4">
        If you see blue background, Tailwind works
      </div>
    </div>
  )
}