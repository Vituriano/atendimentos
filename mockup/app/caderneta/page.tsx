"use client"

import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { HeightChart } from "@/components/charts/height-chart"
import { BmiChart } from "@/components/charts/bmi-chart"
import { MilestonesHistory } from "@/components/milestones-history"
import { currentPatient as defaultPatient } from "@/lib/mock-data"
import { usePatient } from "@/lib/patient-context"

export default function CadernetaDigital() {
  const { activePatient } = usePatient()
  const currentPatient = activePatient || defaultPatient

  return (
    <MainLayout title="Caderneta Digital">
      <div className="space-y-6">
        {/* Patient Selector */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{currentPatient.name}</CardTitle>
                <CardDescription>
                  Prontuário: {currentPatient.record} | Nascimento: {currentPatient.birthDate} | Idade: {currentPatient.age}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                Paciente Selecionado
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="height" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="height">Curva de Estatura</TabsTrigger>
            <TabsTrigger value="bmi">Curva de IMC</TabsTrigger>
            <TabsTrigger value="milestones">Marcos do Desenvolvimento</TabsTrigger>
          </TabsList>

          <TabsContent value="height">
            <Card>
              <CardHeader>
                <CardTitle>Curva de Estatura por Idade</CardTitle>
                <CardDescription>
                  Referência OMS para meninas de 0 a 5 anos. Curvas de escore-z para monitoramento do crescimento.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HeightChart />
                <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-green-800 font-medium">
                    Estatura adequada para a idade (Escore-z entre -1 e 0)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bmi">
            <Card>
              <CardHeader>
                <CardTitle>Curva de IMC por Idade</CardTitle>
                <CardDescription>
                  Índice de Massa Corporal conforme referência OMS. Classificação nutricional baseada em escore-z.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BmiChart />
                <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-green-800 font-medium">
                    Eutrofia (IMC adequado para a idade)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones">
            <Card>
              <CardHeader>
                <CardTitle>Marcos do Desenvolvimento</CardTitle>
                <CardDescription>
                  Histórico completo de avaliação dos marcos do desenvolvimento por faixa etária.
                  Baseado na Caderneta de Saúde da Criança do Ministério da Saúde.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MilestonesHistory />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
