'use client'

import { useReportsController } from '@/controllers/useReportsController'
import { useSessionController } from '@/controllers/useSessionController'
import { AppHeader, BottomNav } from './components/AppHeader'
import { AuthPage } from './pages/AuthPage'
import { MapPage } from './pages/MapPage'
import { ModerationPage } from './pages/ModerationPage'
import { NewReportPage } from './pages/NewReportPage'
import { ProfilePage } from './pages/ProfilePage'
import { ReportsPage } from './pages/ReportsPage'

/** Vista raíz: elige la pantalla según el estado que entrega el controlador. */
export default function App() {
  const session = useSessionController()
  const reports = useReportsController(session.screen)
  const { screen, navigate } = session

  if (screen === 'register' || screen === 'login')
    return (
      <AuthPage
        mode={screen}
        onNavigate={navigate}
        sessionExpired={screen === 'login' && session.sessionExpired}
        notice={session.authNotice}
        onRegistered={() =>
          session.setAuthNotice(
            'Cuenta creada. Ya puedes iniciar sesión.',
          )
        }
      />
    )

  return (
    <div className="min-h-screen bg-[#faf9fd] text-slate-900">
      <AppHeader
        screen={screen}
        onNavigate={navigate}
        onLogout={session.logout}
        profileOpen={session.profileOpen}
        setProfileOpen={session.setProfileOpen}
        user={session.currentUser}
      />
      {screen === 'reports' && (
        <ReportsPage
          onNavigate={navigate}
          municipality={reports.municipality}
          setMunicipality={reports.setMunicipality}
          category={reports.category}
          setCategory={reports.setCategory}
          reports={reports.filtered}
          onClearFilters={reports.clearFilters}
        />
      )}
      {screen === 'map' && (
        <MapPage
          onNavigate={navigate}
          municipality={reports.municipality}
          setMunicipality={reports.setMunicipality}
          category={reports.category}
          setCategory={reports.setCategory}
          reports={reports.filtered}
        />
      )}
      {screen === 'new' && <NewReportPage onNavigate={navigate} />}
      {screen === 'moderation' && <ModerationPage />}
      {screen === 'profile' && (
        <ProfilePage
          user={session.currentUser}
          onExpire={session.expireSession}
          onLogout={session.logout}
          onDeleted={() => navigate('register')}
        />
      )}
      <BottomNav screen={screen} onNavigate={navigate} />
    </div>
  )
}
