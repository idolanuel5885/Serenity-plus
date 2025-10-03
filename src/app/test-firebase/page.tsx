'use client'

import { useEffect, useState } from 'react'
import { db } from '../../../firebase-config'
import { collection, addDoc, getDocs } from 'firebase/firestore'

export default function TestFirebase() {
  const [status, setStatus] = useState('Testing...')
  const [error, setError] = useState('')

  useEffect(() => {
    const testFirebase = async () => {
      try {
        console.log('Testing Firebase connection...')
        setStatus('Testing Firebase connection...')
        
        // Try to add a test document
        const testDoc = await addDoc(collection(db, 'test'), {
          message: 'Hello Firebase!',
          timestamp: new Date()
        })
        
        console.log('Firebase test successful:', testDoc.id)
        setStatus('Firebase test successful!')
        
        // Try to read it back
        const snapshot = await getDocs(collection(db, 'test'))
        console.log('Firebase read test successful:', snapshot.docs.length, 'documents')
        setStatus(`Firebase test successful! Found ${snapshot.docs.length} test documents.`)
        
      } catch (err) {
        console.error('Firebase test failed:', err)
        setError(err instanceof Error ? err.message : String(err))
        setStatus('Firebase test failed')
      }
    }

    testFirebase()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Test</h1>
      <p className="mb-2">Status: {status}</p>
      {error && <p className="text-red-500">Error: {error}</p>}
    </div>
  )
}
