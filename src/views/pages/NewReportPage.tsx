import { useNewReportController } from '@/controllers/useNewReportController'
import { categories, municipalities, referencePoints } from '@/models/constants'
import type { Screen } from '@/models/types'
import { Button } from '../components/Button'
import { Notice, PageTitle } from '../components/Display'
import { ErrorText, SelectField } from '../components/FormControls'
import { Icon } from '../components/Icon'
import { LeafletMap } from '../components/LeafletMapLazy'

export function NewReportPage({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const c = useNewReportController()
  const { errors, position } = c

  if (c.sent) {
    return (
      <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-2xl place-items-center px-5 pb-28 text-center">
        <div className="w-full rounded-3xl border border-violet-100 bg-white p-7 shadow-[0_18px_60px_rgba(65,39,95,.1)] sm:p-12">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-50 text-emerald-700">
            <Icon name="check" size={36} />
          </span>
          <p className="mt-7 text-xs font-extrabold uppercase tracking-[.16em] text-violet-600">
            Reporte enviado
          </p>
          <h1 className="mx-auto mt-3 max-w-lg text-2xl font-bold leading-tight tracking-[-.025em] text-violet-950 sm:text-3xl">
            Tu reporte quedó pendiente de revisión por una persona moderadora
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-500">
            Gracias por aportar. Tu identidad no será visible para la comunidad.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => onNavigate('reports')}>Volver a reportes</Button>
            <Button variant="secondary" onClick={c.reset}>
              Crear otro reporte
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-28 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <PageTitle eyebrow="Aporte anónimo" title="Crear nuevo reporte" />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <form
          onSubmit={c.submit}
          className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8"
          noValidate
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Municipio"
              value={c.municipality}
              onChange={c.setMunicipality}
              options={municipalities}
              placeholder="Selecciona un municipio"
              error={errors.municipality}
            />
            <SelectField
              label="Punto de referencia"
              value={c.reference}
              onChange={c.setReference}
              options={referencePoints[c.municipality] || []}
              placeholder={c.municipality ? 'Selecciona un punto' : 'Primero elige un municipio'}
              error={errors.reference}
            />
          </div>
          <SelectField
            label="Categoría"
            value={c.category}
            onChange={c.setCategory}
            options={categories}
            placeholder="Selecciona una categoría"
            error={errors.category}
          />
          <section>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Ubicación de la situación</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Usa el GPS una vez o selecciona otro lugar haciendo clic en el mapa.
                </p>
              </div>
              <Button variant="secondary" onClick={c.useCurrentLocation} disabled={c.locating}>
                <Icon name="location" size={18} />
                {c.locating ? 'Obteniendo ubicación…' : 'Usar mi ubicación actual'}
              </Button>
            </div>
            {errors.location && <ErrorText>{errors.location}</ErrorText>}
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <LeafletMap
                selectedPosition={position}
                onPositionChange={c.selectManually}
                className="min-h-[430px]"
              />
            </div>
            <div className="mt-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
              {position ? (
                <div className="space-y-1.5">
                  <p>
                    <strong>Latitud:</strong> {position.latitude.toFixed(6)}
                  </p>
                  <p>
                    <strong>Longitud:</strong> {position.longitude.toFixed(6)}
                  </p>
                  <p>
                    <strong>Origen:</strong>{' '}
                    {c.locationSource === 'gps' ? 'GPS' : 'Selección manual'}
                  </p>
                  {c.accuracyM !== null && (
                    <p>
                      <strong>Precisión GPS:</strong> ±{Math.round(c.accuracyM)} m
                    </p>
                  )}
                  {c.address && (
                    <p>
                      <strong>Dirección aproximada:</strong> {c.address}
                    </p>
                  )}
                  {c.addressStatus && (
                    <p className="font-semibold text-amber-800">{c.addressStatus}</p>
                  )}
                  <p className="pt-1 text-slate-400">
                    Puedes arrastrar el marcador para corregir la ubicación.
                  </p>
                </div>
              ) : (
                <p>Las coordenadas aparecerán aquí cuando selecciones una ubicación.</p>
              )}
            </div>
          </section>
          <label className="block">
            <span className="mb-2 flex items-center justify-between text-sm font-bold text-slate-800">
              <span>Descripción</span>
              <span
                className={`text-xs ${
                  c.description.length > 280 ? 'text-rose-600' : 'text-slate-400'
                }`}
              >
                {c.description.length}/280
              </span>
            </span>
            <textarea
              value={c.description}
              maxLength={280}
              rows={5}
              onChange={(event) => c.setDescription(event.target.value)}
              placeholder="Describe de forma clara lo que percibiste, sin incluir datos personales."
              className={`w-full resize-none rounded-xl border bg-white p-4 text-[15px] leading-relaxed outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 ${
                errors.description ? 'border-rose-400' : 'border-slate-200'
              }`}
            />
            {errors.description && <ErrorText>{errors.description}</ErrorText>}
          </label>
          {errors.form && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-semibold text-rose-800">
              {errors.form}
            </div>
          )}
          <Button type="submit" className="w-full sm:w-auto" disabled={c.submitting}>
            {c.submitting ? 'Enviando…' : 'Enviar reporte'} <Icon name="chevron" size={17} />
          </Button>
        </form>
        <aside className="space-y-4">
          <div className="rounded-2xl bg-violet-950 p-5 text-white">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-[#f2b66d]">
              <Icon name="shield" size={20} />
            </span>
            <h2 className="mt-4 font-bold">Tu reporte es anónimo para la comunidad</h2>
            <p className="mt-2 text-xs leading-relaxed text-violet-200">
              No mostraremos tu nombre ni tu correo. Una persona moderadora revisará el contenido
              antes de publicarlo.
            </p>
          </div>
          <Notice />
        </aside>
      </div>
    </main>
  )
}
