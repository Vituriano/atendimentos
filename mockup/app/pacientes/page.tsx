"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty } from "@/components/ui/empty"
import { Search, Eye, EyeOff, UserX, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { allPatients } from "@/lib/mock-data"
import { cn, getInitials } from "@/lib/utils"

const PAGE_SIZE = 20

function maskCpf(cpf: string): string {
  // Mask: ***.xxx.xxx-** (reveal middle 6 digits: positions 4-9)
  return cpf.replace(/^(\d{3})\.(\d{3})\.(\d{3})-(\d{2})$/, "***.$2.$3-**")
}

export default function BasePacientes() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [revealedCpfs, setRevealedCpfs] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)

  // Detect search mode: CPF if contains numbers or CPF format chars
  const isCpfSearch = /[\d.-]/.test(searchQuery)
  const normalizedCpfQuery = searchQuery.replace(/\D/g, "")
  const isCpfComplete = normalizedCpfQuery.length === 11

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) {
      return [...allPatients].sort((a, b) => a.name.localeCompare(b.name))
    }

    if (isCpfSearch) {
      // CPF search: only show results when complete
      if (!isCpfComplete) {
        return []
      }
      return allPatients.filter((p) => {
        const patientCpfNormalized = p.cpf?.replace(/\D/g, "") || ""
        return patientCpfNormalized === normalizedCpfQuery
      })
    } else {
      // Name search: filter as user types
      const query = searchQuery.toLowerCase().trim()
      return allPatients
        .filter((p) => p.name.toLowerCase().includes(query))
        .sort((a, b) => a.name.localeCompare(b.name))
    }
  }, [searchQuery, isCpfSearch, isCpfComplete, normalizedCpfQuery])

  // Reset to page 1 whenever the search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE))
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  // Toggle CPF reveal with auto-hide after 5 seconds
  const toggleCpfReveal = (patientId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setRevealedCpfs((prev) => {
      const next = new Set(prev)
      if (next.has(patientId)) {
        next.delete(patientId)
      } else {
        next.add(patientId)
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setRevealedCpfs((current) => {
            const updated = new Set(current)
            updated.delete(patientId)
            return updated
          })
        }, 5000)
      }
      return next
    })
  }

  const handleRowClick = (patientId: string) => {
    router.push(`/pacientes/${patientId}`)
  }

  // Get last consultation date for a patient
  const getLastConsultation = (patientId: string) => {
    const patient = allPatients.find(p => p.id === patientId)
    if (!patient?.prontuarios?.length) return "—"
    // Get the first consultation from the primary record
    const primaryProntuario = patient.prontuarios.find(p => p.number === patient.primaryRecord) || patient.prontuarios[0]
    return primaryProntuario.consultations.length > 0 ? primaryProntuario.consultations[0].date : "—"
  }

  return (
    <MainLayout title="Base de Pacientes">
      <div className="space-y-6">
        {/* Stats */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{allPatients.length} pacientes cadastrados</span>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* CPF search helper message */}
        {isCpfSearch && !isCpfComplete && searchQuery.length > 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            Digite o CPF completo para buscar (LGPD)
          </div>
        )}

        {/* Patient List */}
        {filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Empty
              icon={UserX}
              title={isCpfSearch && !isCpfComplete ? "Digite o CPF completo" : "Nenhum paciente encontrado"}
              description={
                isCpfSearch && !isCpfComplete
                  ? "Por razoes de privacidade (LGPD), a busca por CPF requer o numero completo."
                  : "Tente ajustar os termos de busca."
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="pl-4 w-[280px]">Paciente</TableHead>
                  <TableHead className="hidden sm:table-cell w-[100px]">Idade</TableHead>
                  <TableHead className="hidden md:table-cell w-[150px]">Prontuario</TableHead>
                  <TableHead className="hidden lg:table-cell w-[180px]">CPF</TableHead>
                  <TableHead className="hidden xl:table-cell w-[140px]">Ultima consulta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPatients.map((patient) => {
                  const isRevealed = revealedCpfs.has(patient.id)
                  const displayCpf = isRevealed ? patient.cpf : maskCpf(patient.cpf || "")

                  return (
                    <TableRow
                      key={patient.id}
                      onClick={() => handleRowClick(patient.id)}
                      className="cursor-pointer hover:bg-slate-50 h-14 transition-colors"
                    >
                      <TableCell className="pl-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-sm font-semibold">
                            {getInitials(patient.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{patient.name}</p>
                            {/* Mobile: show extra info */}
                            <div className="flex flex-wrap gap-2 sm:hidden mt-0.5 text-xs text-muted-foreground">
                              <span>{patient.age}</span>
                              <span>{patient.record}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{patient.age}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {patient.record}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-muted-foreground">{displayCpf}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => toggleCpfReveal(patient.id, e)}
                          >
                            {isRevealed ? (
                              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                        {getLastConsultation(patient.id)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredPatients.length > PAGE_SIZE && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <p className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filteredPatients.length)} de{" "}
                {filteredPatients.length} pacientes
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm font-medium px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Proxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </MainLayout>
  )
}
