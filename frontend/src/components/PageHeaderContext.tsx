import { createContext, ReactNode, useContext } from 'react'

export interface PageHeaderState {
  title: string
  subtitle?: string
  actions?: ReactNode | null
}

export interface PageHeaderContextValue {
  header: PageHeaderState
  setHeader: (state: PageHeaderState) => void
  resetHeader: () => void
}

const PageHeaderContext = createContext<PageHeaderContextValue | undefined>(undefined)

export function usePageHeader() {
  const context = useContext(PageHeaderContext)

  if (!context) {
    throw new Error('usePageHeader debe utilizarse dentro de PageHeaderContext.Provider')
  }

  return context
}

export default PageHeaderContext
