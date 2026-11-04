import { DELETE_CONFIRMATION_WORD, useProfileController } from '@/controllers/useProfileController'
import type { UserSummary } from '@/models/types'
import { Button } from '../components/Button'
import { PageTitle } from '../components/Display'
import { Field } from '../components/FormControls'
import { Icon } from '../components/Icon'

export function ProfilePage({
  onExpire,
  onLogout,
  onDeleted,
  user,
}: {
  onExpire: () => void
  onLogout: () => void
  onDeleted: () => void
  user: UserSummary | null
}) {
  const profile = useProfileController(onDeleted)

  return (
    <main className="mx-auto max-w-3xl px-4 pb-28 pt-8 sm:px-6 lg:pt-12">
      <PageTitle eyebrow="Tu cuenta" title="Perfil" />
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-2xl bg-violet-100 text-violet-800">
            <Icon name="user" size={28} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-violet-950">{user?.name || 'Mi cuenta'}</h2>
            <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
        <div className="mt-7 grid gap-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">Municipio</p>
            <p className="mt-1 font-bold text-slate-800">Facatativá</p>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
          <Button variant="secondary" onClick={onLogout}>
            <Icon name="arrow" size={17} /> Cerrar sesión
          </Button>
          <Button variant="ghost" onClick={onExpire}>
            <Icon name="lock" size={17} /> Ver estado de sesión expirada
          </Button>
        </div>
      </div>

      <section className="mt-6 rounded-3xl border border-rose-200 bg-rose-50/50 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-rose-900">Eliminar cuenta definitivamente</h2>
        <p className="mt-2 text-sm leading-relaxed text-rose-900/80">
          Se borrarán tu cuenta y todos los reportes que enviaste. Esta acción no se puede
          deshacer.
        </p>
        {!profile.confirming ? (
          <Button variant="danger" className="mt-5" onClick={profile.open}>
            <Icon name="close" size={17} /> Eliminar mi cuenta
          </Button>
        ) : (
          <form onSubmit={profile.submit} className="mt-5 space-y-4" noValidate>
            <Field
              label={`Escribe ${DELETE_CONFIRMATION_WORD} para confirmar`}
              value={profile.word}
              onChange={profile.setWord}
              placeholder={DELETE_CONFIRMATION_WORD}
            />
            <Field
              label="Contraseña actual"
              type="password"
              value={profile.password}
              onChange={profile.setPassword}
              placeholder="Tu contraseña"
              icon="lock"
            />
            {profile.error && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-white p-3.5 text-sm font-semibold text-rose-800"
              >
                {profile.error}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" variant="danger" disabled={!profile.canSubmit}>
                {profile.deleting ? 'Eliminando…' : 'Eliminar definitivamente'}
              </Button>
              <Button variant="secondary" onClick={profile.cancel} disabled={profile.deleting}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </section>
    </main>
  )
}
