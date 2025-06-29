import { createContext, useContext, useEffect, useState, useRef } from "react"
import { apiEndpoint } from "@/config/api"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme, saveToProfile?: boolean) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  
  // Track if we're currently saving to prevent loops
  const isSavingRef = useRef(false)
  // Rate limiting to prevent spam requests
  const lastSaveTimeRef = useRef(0)

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  // Function to save theme to user profile
  const saveThemeToProfile = async (newTheme: Theme) => {
    // Prevent recursive calls and rate limiting (max 1 request per 2 seconds)
    const now = Date.now()
    if (isSavingRef.current || now - lastSaveTimeRef.current < 2000) {
      return
    }
    lastSaveTimeRef.current = now
    
    try {
      isSavingRef.current = true
      const accessToken = localStorage.getItem('accessToken')
      
      if (!accessToken) {
        return
      }

      const response = await fetch(apiEndpoint('/auth/me'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          preferences: {
            theme: newTheme
          }
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        console.warn('Failed to save theme to profile:', data.message)
      }
    } catch (error) {
      console.warn('Error saving theme to profile:', error)
      // Don't throw error - just log it so theme still works locally
    } finally {
      isSavingRef.current = false
    }
  }

  const value = {
    theme,
    setTheme: (newTheme: Theme, saveToProfile: boolean = true) => {
      // Save to localStorage immediately
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
      
      // Only save to user profile if explicitly requested (user action, not programmatic)
      if (saveToProfile && !isSavingRef.current) {
        saveThemeToProfile(newTheme).catch(error => {
          console.warn('Failed to save theme to profile:', error)
        })
      }
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
