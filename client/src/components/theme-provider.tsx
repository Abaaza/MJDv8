import { createContext, useContext, useEffect, useState } from "react"
import { apiEndpoint } from "@/config/api"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
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
    try {
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
    }
  }

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      // Save to localStorage immediately
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
      
      // Save to user profile (async, non-blocking)
      saveThemeToProfile(newTheme).catch(error => {
        console.warn('Failed to save theme to profile:', error)
      })
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
