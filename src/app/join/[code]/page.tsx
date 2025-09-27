import Link from 'next/link'

export async function generateStaticParams() {
  return [
    { code: 'demo123' },
    { code: 'test456' },
    { code: 'sample789' }
  ]
}

export default function JoinPage() {
  // Static version for export
  const inviteData = {
    inviterName: 'Sarah',
    inviterImage: '/placeholder-avatar.jpg',
    isValid: true
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Serenity+" className="w-6 h-6" />
          <span className="font-bold text-lg">Serenity+</span>
        </div>
      </div>
      
      <div className="p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Join Meditation Partnership</h1>
          <p className="text-lg text-gray-600">
            You&apos;re joining {inviteData.inviterName}&apos;s meditation partnership.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">{inviteData.inviterName}</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              {inviteData.inviterImage ? (
                <img 
                  src={inviteData.inviterImage} 
                  alt={`${inviteData.inviterName}'s avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {inviteData.inviterName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">Meditation Partner</p>
              <p className="text-sm text-gray-600">Ready to start your journey together</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">What happens next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">1</span>
              </div>
              <p className="text-gray-600">Set up your meditation preferences</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">2</span>
              </div>
              <p className="text-gray-600">Start your meditation journey together</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">3</span>
              </div>
              <p className="text-gray-600">Support each other&apos;s practice</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link 
            href="/welcome"
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-center block hover:bg-blue-700 transition-colors"
          >
            Accept Partnership
          </Link>
          <Link 
            href="/"
            className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-lg font-semibold text-center block hover:bg-gray-200 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}