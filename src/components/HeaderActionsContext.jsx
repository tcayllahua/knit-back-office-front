import { createContext, useContext, useState, useCallback } from 'react'

const HeaderActionsContext = createContext(null)

export const HeaderActionsProvider = ({ children }) => {
  const [headerActions, setHeaderActions] = useState(null)

  const setActions = useCallback((actions) => {
    setHeaderActions(actions)
  }, [])

  const clearActions = useCallback(() => {
    setHeaderActions(null)
  }, [])

  return (
    <HeaderActionsContext.Provider value={{ headerActions, setActions, clearActions }}>
      {children}
    </HeaderActionsContext.Provider>
  )
}

export const useHeaderActions = () => {
  const ctx = useContext(HeaderActionsContext)
  if (!ctx) throw new Error('useHeaderActions must be used within HeaderActionsProvider')
  return ctx
}
