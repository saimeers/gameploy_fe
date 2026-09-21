import { useTheme }  from '@/components/ThemeProvider'
import Navbar        from '@/pages/home/Navbar'
import Hero          from '@/pages/home/Hero'
import Features      from '@/pages/home/Features'
import Footer        from '@/pages/home/Footer'
import Aurora        from '@/components/Aurora'

const AURORA_DARK  = ['#1a0533', '#0f1a40', '#1a0533']
const AURORA_LIGHT = ['#c9d6ff', '#e2e2e2', '#a8c0ff']

export default function HomePage() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')

  return (
    <div className="relative min-h-screen selection:bg-primary/30 selection:text-foreground">
      <div className="fixed inset-0 z-[-1]">
        <Aurora
          colorStops={isDark ? AURORA_DARK : AURORA_LIGHT}
          blend={isDark ? 0.5 : 0.35}
          amplitude={isDark ? 1.0 : 0.6}
          speed={0.5}
        />
        <div className={`absolute inset-0 transition-colors duration-500 ${
          isDark ? 'bg-background/55' : 'bg-background/65'
        }`} />
      </div>

      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <Hero />
      <Features />
      <Footer />
    </div>
  )
}