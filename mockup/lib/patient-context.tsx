"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Patient, EntryType } from "./types"
import { currentPatient as defaultPatient } from "./mock-data"

interface ActivePatient extends Patient {
  visitType: EntryType
}

interface PatientContextType {
  activePatient: ActivePatient | null
  setActivePatient: (patient: Patient, visitType: EntryType) => void
  clearActivePatient: () => void
  entryType: EntryType | null
}

const PatientContext = createContext<PatientContextType | undefined>(undefined)

export function PatientProvider({ children }: { children: ReactNode }) {
  const [activePatient, setActivePatientState] = useState<ActivePatient | null>(null)

  const setActivePatient = useCallback((patient: Patient, visitType: EntryType) => {
    setActivePatientState({ ...patient, visitType })
  }, [])

  const clearActivePatient = useCallback(() => {
    setActivePatientState(null)
  }, [])

  const entryType = activePatient?.visitType ?? null

  return (
    <PatientContext.Provider value={{ activePatient, setActivePatient, clearActivePatient, entryType }}>
      {children}
    </PatientContext.Provider>
  )
}

export function usePatient() {
  const context = useContext(PatientContext)
  if (context === undefined) {
    throw new Error("usePatient must be used within a PatientProvider")
  }
  return context
}

/**
 * Hook that returns the current patient (active or default fallback)
 * Use this to avoid repeating `activePatient || defaultPatient` pattern
 */
export function useCurrentPatient() {
  const { activePatient } = usePatient()
  return activePatient || defaultPatient
}
