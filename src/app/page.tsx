import { getServices } from '@/services'

/**
 * Root Diagnostic Page
 * 
 * Verifies that the Service/Repository abstraction layer is correctly wired up
 * and loads data based on the NEXT_PUBLIC_SERVICE_PROVIDER setting.
 */
export default async function Home() {
  // Since this is a server component, we retrieve services. 
  // For Supabase, we would pass the server-side client, e.g.:
  // const supabase = await createClient()
  // const services = getServices(supabase)
  const services = getServices()
  
  let settings
  try {
    settings = await services.store.getSettings()
  } catch (error: unknown) {
    settings = {
      name: 'Error Loading Settings',
      description: error instanceof Error ? error.message : String(error),
      currency: '-',
      address: '-',
      phone: '-',
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-950 text-zinc-100 font-sans">
      <main className="max-w-md w-full p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">{settings.name}</h1>
          <p className="text-sm text-zinc-400 mt-1">{settings.description}</p>
        </div>
        
        <div className="border-t border-zinc-800 pt-4 space-y-2 text-sm text-zinc-300">
          <div>
            <span className="text-zinc-500 font-medium">Mata Uang: </span>
            {settings.currency}
          </div>
          <div>
            <span className="text-zinc-500 font-medium">Alamat: </span>
            {settings.address}
          </div>
          <div>
            <span className="text-zinc-500 font-medium">No. HP: </span>
            {settings.phone}
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-4 text-[11px] text-zinc-500 space-y-1">
          <div>
            <span className="font-semibold text-zinc-400">Mode Service: </span>
            <code className="bg-zinc-800 px-1 py-0.5 rounded text-yellow-400">
              {process.env.NEXT_PUBLIC_SERVICE_PROVIDER || 'mock'}
            </code>
          </div>
          <p>
            Ubah variabel <code>NEXT_PUBLIC_SERVICE_PROVIDER</code> di <code>.env.local</code> untuk beralih mode.
          </p>
        </div>
      </main>
    </div>
  )
}
