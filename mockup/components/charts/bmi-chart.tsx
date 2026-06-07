"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts"
import { whoBmiReference, bmiData } from "@/lib/mock-data"

// Transform WHO reference data to chart format
function generateChartData() {
  const ages = [0, 6, 12, 18, 24, 30, 36, 48, 60]
  
  return ages.map((age, index) => ({
    age,
    ageLabel: age === 0 ? "0" : age < 12 ? `${age}m` : `${age / 12}a`,
    zScore3: whoBmiReference.zScore3[index]?.value,
    zScore2: whoBmiReference.zScore2[index]?.value,
    zScore1: whoBmiReference.zScore1[index]?.value,
    zScore0: whoBmiReference.zScore0[index]?.value,
    zScoreNeg1: whoBmiReference.zScoreNeg1[index]?.value,
    zScoreNeg2: whoBmiReference.zScoreNeg2[index]?.value,
    zScoreNeg3: whoBmiReference.zScoreNeg3[index]?.value,
  }))
}

// Get patient data points
function getPatientDataPoints() {
  return bmiData.map((point, index) => ({
    ...point,
    isCurrent: index === bmiData.length - 1,
  }))
}

const chartData = generateChartData()
const patientPoints = getPatientDataPoints()

// Custom tooltip component
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { age: number; patientBmi?: number } }> }) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload
    const patientPoint = patientPoints.find(p => p.ageInMonths === data.age)
    
    if (patientPoint) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-sm">Idade: {data.age} meses</p>
          <p className="text-teal-700 font-semibold">IMC: {patientPoint.value} kg/m²</p>
          <p className="text-xs text-muted-foreground mt-1">Classificação: Eutrofia</p>
        </div>
      )
    }
  }
  return null
}

export function BmiChart() {
  // Merge patient data into chart data for rendering
  const mergedData = chartData.map(point => {
    const patientPoint = patientPoints.find(p => p.ageInMonths === point.age)
    return {
      ...point,
      patientBmi: patientPoint?.value,
    }
  })

  // Add patient-specific data points
  patientPoints.forEach(point => {
    if (!mergedData.find(d => d.age === point.ageInMonths)) {
      mergedData.push({
        age: point.ageInMonths,
        ageLabel: `${point.ageInMonths}m`,
        patientBmi: point.value,
        zScore3: undefined,
        zScore2: undefined,
        zScore1: undefined,
        zScore0: undefined,
        zScoreNeg1: undefined,
        zScoreNeg2: undefined,
        zScoreNeg3: undefined,
      })
    }
  })

  mergedData.sort((a, b) => a.age - b.age)

  return (
    <div className="w-full">
      <div className="h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mergedData}
            margin={{ top: 20, right: 120, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            
            {/* Eutrofia band highlight */}
            <ReferenceArea
              y1={12.5}
              y2={15.5}
              fill="#10b981"
              fillOpacity={0.1}
            />

            <XAxis
              dataKey="age"
              type="number"
              domain={[0, 60]}
              tickFormatter={(value) => {
                if (value === 0) return "0"
                if (value === 12) return "1 ano"
                if (value === 24) return "2 anos"
                if (value === 36) return "3 anos"
                if (value === 48) return "4 anos"
                if (value === 60) return "5 anos"
                return ""
              }}
              ticks={[0, 12, 24, 36, 48, 60]}
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: "#94a3b8" }}
            />
            <YAxis
              domain={[10, 22]}
              tickFormatter={(value) => `${value}`}
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: "#94a3b8" }}
              label={{ value: "IMC (kg/m²)", angle: -90, position: "insideLeft", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Z-score reference lines */}
            <Line
              type="monotone"
              dataKey="zScore3"
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              connectNulls
              opacity={0.7}
            />
            <Line
              type="monotone"
              dataKey="zScore2"
              stroke="#f97316"
              strokeWidth={1}
              dot={false}
              connectNulls
              opacity={0.7}
            />
            <Line
              type="monotone"
              dataKey="zScore1"
              stroke="#16a34a"
              strokeWidth={1}
              dot={false}
              connectNulls
              opacity={0.7}
            />
            <Line
              type="monotone"
              dataKey="zScore0"
              stroke="#000000"
              strokeWidth={2}
              dot={false}
              connectNulls
              opacity={0.8}
            />
            <Line
              type="monotone"
              dataKey="zScoreNeg1"
              stroke="#16a34a"
              strokeWidth={1}
              dot={false}
              connectNulls
              opacity={0.7}
            />
            <Line
              type="monotone"
              dataKey="zScoreNeg2"
              stroke="#f97316"
              strokeWidth={1}
              dot={false}
              connectNulls
              opacity={0.7}
            />
            <Line
              type="monotone"
              dataKey="zScoreNeg3"
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              connectNulls
              opacity={0.7}
            />

            {/* Patient data line */}
            <Line
              type="monotone"
              dataKey="patientBmi"
              stroke="#0f766e"
              strokeWidth={2}
              dot={{ fill: "#0f766e", strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: "#0f766e" }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Nutritional classification labels */}
      <div className="grid grid-cols-2 gap-4 mt-4 px-4">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-0.5 bg-red-500" style={{ borderStyle: "dashed" }}></div>
            <span className="text-muted-foreground">+3 / -3</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-0.5 bg-orange-500"></div>
            <span className="text-muted-foreground">+2 / -2</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-0.5 bg-green-600"></div>
            <span className="text-muted-foreground">+1 / -1</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 bg-black"></div>
            <span className="text-muted-foreground">Mediana</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-teal-700"></div>
            <span className="text-muted-foreground">Paciente</span>
          </div>
        </div>
        <div className="text-xs space-y-1 text-right">
          <div className="text-red-600">Acima de +3: Obesidade</div>
          <div className="text-orange-600">Entre +2 e +3: Sobrepeso</div>
          <div className="text-amber-600">Entre +1 e +2: Risco de sobrepeso</div>
          <div className="text-green-600 font-medium">Entre -1 e +1: Eutrofia</div>
          <div className="text-orange-600">Entre -2 e -1: Magreza</div>
          <div className="text-red-600">Abaixo de -3: Magreza acentuada</div>
        </div>
      </div>
    </div>
  )
}
