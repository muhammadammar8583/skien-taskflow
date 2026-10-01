'use client'

import { useRef } from 'react'
import { useState } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { makePersistor, makeStore, type AppPersistor, type AppStore } from './store'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const reduxRef = useRef<{ store: AppStore; persistor: AppPersistor } | null>(null)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))

  if (!reduxRef.current) {
    const store = makeStore()
    reduxRef.current = { store, persistor: makePersistor(store) }
  }

  const { store, persistor } = reduxRef.current

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </PersistGate>
    </Provider>
  )
}