"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import {
  dashboardStats,
  consultationsByType,
  avgTimeByWeek,
  populationAlerts,
  encaminhamentosPorEspecialidade,
  cidsMaisFrequentes,
} from "@/lib/mock-data"
import { FileText, Clock, ArrowUpRight, AlertTriangle, Send, AlertOctagon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { CategoryBadge } from "@/components/category-badge"

// Calculate return rate
const totalEncaminhados = encaminhamentosPorEspecialidade.reduce((sum, e) => sum + e.encaminhados, 0)
const totalRetornos = encaminhamentosPorEspecialidade.reduce((sum, e) => sum + e.retornoConfirmado, 0)
const taxaRetorno = Math.round((totalRetornos / totalEncaminhados) * 100)

const kpis = [
  {
    label: "Consultas realizadas",
    value: dashboardStats.totalConsultations,
    icon: FileText,
    color: "text-slate-700",
  },
  {
    label: "Tempo médio de consulta",
    value: `${dashboardStats.avgConsultationTime} min`,
    subtitle: `meta: ${dashboardStats.targetTime} min`,
    subtitleColor: "text-amber-600",
    icon: Clock,
    color: "text-slate-700",
  },
  {
    label: "Taxa de encaminhamentos",
    value: `${dashboardStats.referralRate}%`,
    icon: ArrowUpRight,
    color: "text-slate-700",
  },
  {
    label: "Formulários incompletos",
    value: `${dashboardStats.incompleteFormRate}%`,
    icon: AlertTriangle,
    color: "text-amber-600",
  },
]

const kpisRow2 = [
  {
    label: "Taxa de retorno de encaminhamentos",
    value: `${taxaRetorno}%`,
    subtitle: `${100 - taxaRetorno}% sem retorno confirmado`,
    subtitleColor: "text-amber-600",
    icon: Send,
    color: "text-teal-600",
  },
  {
    label: "Alertas de negligência",
    value: "3 pacientes",
    subtitle: "Requer acionamento do Serviço Social",
    subtitleColor: "text-red-600",
    icon: AlertOctagon,
    color: "text-red-600",
  },
]

// Category filter options
const categoryFilters: Array<{ value: string; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "peso", label: "Peso" },
  { value: "marco", label: "Marco" },
  { value: "encaminhamento", label: "Encaminhamento" },
  { value: "falta", label: "Falta" },
  { value: "negligencia", label: "Negligencia" },
]

// Transform CID data for horizontal bar chart
const cidChartData = cidsMaisFrequentes.map(cid => ({
  name: `${cid.codigo} — ${cid.descricao.substring(0, 30)}${cid.descricao.length > 30 ? '...' : ''}`,
  fullDesc: `${cid.codigo} — ${cid.descricao}`,
  consultas: cid.freq,
}))

export default function DashboardGerencial() {
  const [categoryFilter, setCategoryFilter] = useState("todos")

  const filteredAlerts = populationAlerts.filter(alert => 
    categoryFilter === "todos" || alert.categoria === categoryFilter
  )

  return (
    <MainLayout title="Dashboard Gerencial">
      <div className="space-y-6">
        {/* Date Range Filter */}
        <div className="flex justify-end">
          <Select defaultValue="30">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards Row 1 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.label}
                </CardTitle>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                {kpi.subtitle && (
                  <p className={`text-xs ${kpi.subtitleColor || "text-muted-foreground"}`}>
                    {kpi.subtitle}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* KPI Cards Row 2 - New cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {kpisRow2.map((kpi) => (
            <Card key={kpi.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.label}
                </CardTitle>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                {kpi.subtitle && (
                  <p className={`text-xs ${kpi.subtitleColor || "text-muted-foreground"}`}>
                    {kpi.subtitle}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Consultations by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Consultas por Tipo de Entrada</CardTitle>
              <CardDescription>Últimas 4 semanas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consultationsByType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend
                      wrapperStyle={{ fontSize: "12px" }}
                      formatter={(value) => {
                        const labels: Record<string, string> = {
                          retorno: "Retorno",
                          egresso: "Egresso",
                          internacao: "Internação",
                          encaminhamento: "Encaminhamento",
                        }
                        return labels[value] || value
                      }}
                    />
                    <Bar dataKey="retorno" fill="#0f766e" name="retorno" />
                    <Bar dataKey="egresso" fill="#0ea5e9" name="egresso" />
                    <Bar dataKey="internacao" fill="#f43f5e" name="internacao" />
                    <Bar dataKey="encaminhamento" fill="#8b5cf6" name="encaminhamento" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Average Consultation Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tempo Médio de Consulta por Semana</CardTitle>
              <CardDescription>Meta: 45 minutos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={avgTimeByWeek}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis domain={[30, 60]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <ReferenceLine
                      y={45}
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      label={{ value: "Meta", position: "right", fill: "#ef4444", fontSize: 11 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgTime"
                      stroke="#0f766e"
                      strokeWidth={2}
                      dot={{ fill: "#0f766e", r: 4 }}
                      name="Tempo médio (min)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Charts Row - CIDs and Encaminhamentos Table */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* CIDs Mais Frequentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">CIDs Mais Frequentes no Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cidChartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 10 }} 
                      width={180}
                    />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value} consultas`, 
                        props.payload.fullDesc
                      ]}
                    />
                    <Bar 
                      dataKey="consultas" 
                      fill="#0f766e" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Efetividade dos Encaminhamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Efetividade dos Encaminhamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Especialidade</TableHead>
                    <TableHead className="text-right">Encam.</TableHead>
                    <TableHead className="text-right">Retorno</TableHead>
                    <TableHead className="text-right">Pend.</TableHead>
                    <TableHead className="text-right">% Retorno</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {encaminhamentosPorEspecialidade.map((item) => {
                    const percentRetorno = Math.round((item.retornoConfirmado / item.encaminhados) * 100)
                    return (
                      <TableRow key={item.especialidade}>
                        <TableCell className="font-medium">{item.especialidade}</TableCell>
                        <TableCell className="text-right">{item.encaminhados}</TableCell>
                        <TableCell className="text-right">{item.retornoConfirmado}</TableCell>
                        <TableCell className="text-right">{item.pendentes}</TableCell>
                        <TableCell className={cn(
                          "text-right font-semibold",
                          percentRetorno < 50 && "text-red-600",
                          percentRetorno >= 50 && percentRetorno < 70 && "text-amber-600",
                          percentRetorno >= 70 && "text-green-600"
                        )}>
                          {percentRetorno}%
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-3">
                Retorno confirmado = paciente atendido pelo especialista e com registro de retorno no prontuário.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Population Alerts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alertas Populacionais</CardTitle>
            <CardDescription>
              Pacientes com alertas de desenvolvimento ativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categoryFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setCategoryFilter(filter.value)}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                    categoryFilter === filter.value
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Alerta</TableHead>
                  <TableHead>Última Consulta</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{alert.patient}</TableCell>
                    <TableCell>
                      <CategoryBadge categoria={alert.categoria} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-amber-800">{alert.alert}</span>
                      </div>
                    </TableCell>
                    <TableCell>{alert.lastConsultation}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/pacientes/${alert.patientId}`}>Ver Briefing</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
