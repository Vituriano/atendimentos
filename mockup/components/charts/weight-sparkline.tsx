"use client"

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import { consultationHistory } from "@/lib/mock-data"

const data = consultationHistory.map((c, index) => ({
  index,
  weight: c.weight,
})).reverse()

export function WeightSparkline() {
  return (
    <div className="h-[80px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} hide />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#0f766e"
            strokeWidth={2}
            dot={{ fill: "#0f766e", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        {data.map((d, i) => (
          <span key={i}>{d.weight}kg</span>
        ))}
      </div>
    </div>
  )
}
