import { useAuthController } from '@/controllers/useAuthController'
import type { AuthMode, Screen } from '@/models/types'
import { Button } from '../components/Button'
import { Notice } from '../components/Display'
import { Field } from '../components/FormControls'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'

export function AuthPage({
  mode,
  onNavigate,
  sessionExpired,
  notice,
  onRegistered,
}: {
  mode: AuthMode
  onNavigate: (screen: Screen) => void
  sessionExpired?: boolean
  notice?: string
  onRegistered?: () => void
}) {
  const { isRegister, email, setEmail, password, setPassword, errors, locked, submit } =
    useAuthController(mode, onNavigate, onRegistered)

  return (
    <div className="min-h-screen bg-[#faf9fd] lg:grid lg:grid-cols-[minmax(360px,0.9fr)_1.1fr]">
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16 lg:py-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-12">
          {sessionExpired && (
            <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <Icon name="lock" size={19} />
              <div>
                <strong className="block">Tu sesión expiró</strong>
                <span>Inicia sesión de nuevo para continuar.</span>
              </div>
            </div>
          )}
          {notice && !isRegister && (
            <div className="mb-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
              <Icon name="check" size={19} />
              <span>{notice}</span>
            </div>
          )}
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[.18em] text-violet-600">
            {isRegister ? 'Únete a la comunidad' : 'Qué bueno verte'}
          </p>
          <h1 className="text-[32px] font-bold leading-tight tracking-[-.035em] text-violet-950">
            {isRegister ? 'Crea tu cuenta' : 'Inicia sesión'}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            {isRegister
              ? 'Consulta y aporta información para recorrer nuestros municipios con más contexto.'
              : 'Accede a los reportes comunitarios de tu zona.'}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
            <Field
              label={isRegister ? 'Correo electrónico' : 'Correo o usuario'}
              value={email}
              onChange={setEmail}
              placeholder={isRegister ? 'tu@correo.com' : 'Ej. Felipe@gmail.com'}
              type={isRegister ? 'email' : 'text'}
              error={errors.email}
            />
            <Field
              label="Contraseña"
              value={password}
              onChange={setPassword}
              placeholder={isRegister ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
              type="password"
              error={errors.password}
            />
            {errors.form && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-semibold text-rose-800">
                {errors.form}
              </div>
            )}
            {locked && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                <strong className="block">Acceso bloqueado temporalmente</strong>
                <span className="mt-1 block text-xs leading-relaxed">
                  Detectamos varios intentos fallidos. Intenta de nuevo en 15 minutos.
                </span>
              </div>
            )}
            <Button type="submit" disabled={locked} className="w-full">
              {isRegister ? 'Crear cuenta' : 'Iniciar sesión'} <Icon name="chevron" size={17} />
            </Button>
          </form>
          {!isRegister && (
            <p className="mt-3 text-center text-xs text-slate-400">
              Usuario moderador configurado: Felipe@gmail.com
            </p>
          )}
          <p className="mt-7 text-center text-sm text-slate-600">
            {isRegister ? '¿Ya tienes una cuenta?' : '¿Aún no tienes una cuenta?'}{' '}
            <button
              className="min-h-11 font-bold text-violet-800 underline decoration-violet-200 underline-offset-4"
              onClick={() => onNavigate(isRegister ? 'login' : 'register')}
            >
              {isRegister ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </p>
          <div className="mt-8">
            <Notice />
          </div>
        </div>
      </section>
      <section className="relative hidden overflow-hidden bg-violet-950 p-12 text-white lg:flex lg:flex-col lg:justify-end">
        <div className="absolute left-[12%] top-[12%] size-72 rounded-full border border-white/10" />
        <div className="absolute left-[28%] top-[26%] size-72 rounded-full border border-white/10" />
        <div className="absolute right-[8%] top-[15%] h-[46%] w-[56%] rotate-6 rounded-[50%] bg-violet-800/50 blur-sm" />
        <div className="map-lines absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-lg">
          <span className="mb-7 grid size-14 place-items-center rounded-2xl bg-[#f2a65a] text-violet-950 shadow-lg">
            <Icon name="location" size={27} />
          </span>
          <blockquote className="text-4xl font-semibold leading-[1.16] tracking-[-.04em]">
            Conocer lo que otras personas perciben también nos ayuda a decidir.
          </blockquote>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-violet-200">
            Información comunitaria, anónima y moderada para Facatativá y municipios cercanos.
          </p>
        </div>
      </section>
    </div>
  )
}
