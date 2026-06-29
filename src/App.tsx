import { useState } from 'react'

import { Button } from '@/components/ui/button'

const cloneCommand = '/clone-website <url>'

export default function App() {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'unavailable'>('idle')

  function copyCommand(): void {
    if (!navigator.clipboard) {
      setCopyStatus('unavailable')
      return
    }

    void navigator.clipboard
      .writeText(cloneCommand)
      .then(() => setCopyStatus('copied'))
      .catch(() => setCopyStatus('unavailable'))
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">clone-vite</h1>
        <p className="text-sm text-muted-foreground">
          Run <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{cloneCommand}</code> to begin.
        </p>
        <div className="flex justify-center">
          <Button type="button" variant="outline" onClick={copyCommand}>
            {copyStatus === 'copied' ? 'Copied command' : 'Copy command'}
          </Button>
        </div>
        <p aria-live="polite" className="min-h-5 text-sm text-muted-foreground">
          {copyStatus === 'unavailable' ? 'Clipboard access is unavailable in this browser.' : ''}
        </p>
      </div>
    </main>
  )
}
