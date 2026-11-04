'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { validateNewReport } from '@/models/validation'
import type { FormErrors, LocationSource, MapPosition, Taxonomy } from '@/models/types'
import { reverseGeocode } from '@/services/geoService'
import { fetchTaxonomy, submitReport } from '@/services/reportService'

/** Controla el formulario de creación de reportes. */
export function useNewReportController() {
  const [municipality, setMunicipalityValue] = useState('')
  const [reference, setReferenceValue] = useState('')
  const [category, setCategoryValue] = useState('')
  const [description, setDescriptionValue] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [sent, setSent] = useState(false)
  const [position, setPosition] = useState<MapPosition | null>(null)
  const [accuracyM, setAccuracyM] = useState<number | null>(null)
  const [locationSource, setLocationSource] = useState<LocationSource>('manual')
  const [address, setAddress] = useState('')
  const [addressStatus, setAddressStatus] = useState('')
  const [locating, setLocating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  // Guarda síncrona: un doble clic dispara dos eventos antes de que React pinte el estado.
  const submittingRef = useRef(false)
  const [taxonomy, setTaxonomy] = useState<Taxonomy>({ municipalities: [], categories: [] })

  useEffect(() => {
    fetchTaxonomy()
      .then(setTaxonomy)
      .catch(() =>
        setErrors((current) => ({
          ...current,
          form: 'No fue posible cargar municipios y categorías',
        })),
      )
  }, [])

  const setMunicipality = (value: string) => {
    setMunicipalityValue(value)
    setReferenceValue('')
    setErrors({})
  }

  const setReference = (value: string) => {
    setReferenceValue(value)
    setErrors({})
  }

  const setCategory = (value: string) => {
    setCategoryValue(value)
    setErrors({})
  }

  const setDescription = (value: string) => {
    setDescriptionValue(value)
    setErrors({})
  }

  const resolveAddress = async (next: MapPosition) => {
    setAddress('')
    setAddressStatus('Buscando dirección aproximada…')
    try {
      setAddress(await reverseGeocode(next))
      setAddressStatus('')
    } catch {
      setAddressStatus(
        'No fue posible obtener la dirección. Puedes enviar el reporte con estas coordenadas.',
      )
    }
  }

  const selectManually = (next: MapPosition) => {
    setPosition(next)
    setAccuracyM(null)
    setLocationSource('manual')
    setErrors((current) => ({ ...current, location: '' }))
    void resolveAddress(next)
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrors((current) => ({
        ...current,
        location: 'Tu navegador no permite obtener la ubicación',
      }))
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (result) => {
        const next = {
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
        }
        setPosition(next)
        setAccuracyM(result.coords.accuracy)
        setLocationSource('gps')
        setLocating(false)
        setErrors((current) => ({ ...current, location: '' }))
        void resolveAddress(next)
      },
      () => {
        setLocating(false)
        setErrors((current) => ({
          ...current,
          location: 'No fue posible obtener tu ubicación. Selecciónala manualmente en el mapa.',
        }))
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    )
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submittingRef.current) return
    const validation = validateNewReport({ municipality, reference, category, description, position })
    setErrors(validation)
    if (Object.keys(validation).length || !position) return

    submittingRef.current = true
    setSubmitting(true)
    // Si el catálogo aún no terminó de cargar (conexión lenta), se pide de nuevo antes de enviar.
    let catalog = taxonomy
    if (!catalog.municipalities.length || !catalog.categories.length) {
      catalog = await fetchTaxonomy().catch(() => catalog)
      setTaxonomy(catalog)
    }
    const municipalityId = catalog.municipalities.find((item) => item.name === municipality)?.id
    const categoryId = catalog.categories.find((item) => item.name === category)?.id
    if (!municipalityId || !categoryId) {
      setErrors({ form: 'No fue posible validar el municipio o la categoría' })
      submittingRef.current = false
      setSubmitting(false)
      return
    }

    let result: Awaited<ReturnType<typeof submitReport>>
    try {
      result = await submitReport({
      latitude: position.latitude,
      longitude: position.longitude,
      accuracy_m: accuracyM,
      address,
      municipality_id: municipalityId,
      category_id: categoryId,
      description,
      location_source: locationSource,
      reference_point: reference,
      })
    } catch {
      result = { ok: false, error: 'No hay conexión con el servidor. Intenta de nuevo.' }
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
    if (!result.ok) {
      setErrors({ form: result.error || 'No fue posible enviar el reporte' })
      return
    }
    setSent(true)
  }

  const reset = () => {
    setSent(false)
    setMunicipalityValue('')
    setReferenceValue('')
    setCategoryValue('')
    setDescriptionValue('')
    setPosition(null)
    setAccuracyM(null)
    setAddress('')
  }

  return {
    municipality,
    setMunicipality,
    reference,
    setReference,
    category,
    setCategory,
    description,
    setDescription,
    errors,
    sent,
    position,
    accuracyM,
    locationSource,
    address,
    addressStatus,
    locating,
    submitting,
    selectManually,
    useCurrentLocation,
    submit,
    reset,
  }
}
