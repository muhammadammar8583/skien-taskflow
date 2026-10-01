import { configureStore } from '@reduxjs/toolkit'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { createLogger } from 'redux-logger'
import { useDispatch, useSelector } from 'react-redux'
import AuthReducer from '@/reducers/AuthReducer'

const persistedAuthReducer = persistReducer(
  {
    key: 'auth',
    storage,
    whitelist: ['user', 'token'],
  },
  AuthReducer,
)

const logger = createLogger({
  collapsed: true,
  actionTransformer: (action) => {
    if (typeof action.type !== 'string' || !action.type.startsWith('auth/')) {
      return action
    }

    const safeAction = { ...action }

    if (action.meta?.arg && typeof action.meta.arg === 'object') {
      const safeArguments = { ...action.meta.arg }
      for (const key of [
        'password',
        'confirm_password',
        'confirmPassword',
        'currentPassword',
        'current_password',
        'newPassword',
        'new_password',
        'token',
      ]) {
        if (key in safeArguments) {
          safeArguments[key] = '[REDACTED]'
        }
      }
      safeAction.meta = {
        ...action.meta,
        arg: safeArguments,
      }
    }

    if (action.payload && typeof action.payload === 'object' && 'token' in action.payload) {
      safeAction.payload = { ...action.payload, token: '[REDACTED]' }
    }

    return safeAction
  },
  stateTransformer: (state) => ({
    ...state,
    auth: state.auth
      ? { ...state.auth, token: state.auth.token ? '[REDACTED]' : null }
      : state.auth,
  }),
})

export const makeStore = () => configureStore({
  reducer: {
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })

    return process.env.NODE_ENV === 'development'
      ? middleware.concat(logger)
      : middleware
  },
})

export type AppStore = ReturnType<typeof makeStore>
export const makePersistor = (store: AppStore) => persistStore(store)
export type AppPersistor = ReturnType<typeof makePersistor>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()