import { categories, municipalities } from '@/models/constants'
import { Button } from './Button'
import { SelectField } from './FormControls'

export function FilterBar({
  municipality,
  setMunicipality,
  category,
  setCategory,
  compact = false,
}: {
  municipality: string
  setMunicipality: (value: string) => void
  category: string
  setCategory: (value: string) => void
  compact?: boolean
}) {
  return (
    <div className={`grid gap-3 ${compact ? 'sm:grid-cols-2' : 'lg:grid-cols-[1fr_1fr_auto]'}`}>
      <SelectField
        label="Municipio"
        value={municipality}
        onChange={setMunicipality}
        options={municipalities}
        placeholder="Todos los municipios"
      />
      <SelectField
        label="Categoría"
        value={category}
        onChange={setCategory}
        options={categories}
        placeholder="Todas las categorías"
      />
      {!compact && (
        <Button
          variant="ghost"
          className="self-end px-4"
          onClick={() => {
            setMunicipality('')
            setCategory('')
          }}
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
