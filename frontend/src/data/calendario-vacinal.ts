// ADR-004 equivalent: vacinas são definidas estaticamente como protocolo clínico versionado.
// Fonte de verdade: Calendário Nacional de Imunização (PNI 2024). Alterações exigem instrução clínica explícita.

export interface DoseVacina {
  id: string
  label: string
}

export interface VacinaCalendario {
  id: string
  nome: string
  cor: string
  doses: DoseVacina[]
}

export const calendarioVacinal: VacinaCalendario[] = [
  {
    id: 'bcg',
    nome: 'BCG',
    cor: 'indigo',
    doses: [
      { id: 'dose-unica', label: 'Dose única' },
    ],
  },
  {
    id: 'hepatite-b',
    nome: 'Hepatite B',
    cor: 'orange',
    doses: [
      { id: 'ao-nascer', label: 'Ao nascer' },
    ],
  },
  {
    id: 'penta',
    nome: 'Penta',
    cor: 'red',
    doses: [
      { id: '1a', label: '1ª Dose' },
      { id: '2a', label: '2ª Dose' },
      { id: '3a', label: '3ª Dose' },
    ],
  },
  {
    id: 'rotavirus',
    nome: 'Rotavírus Humano',
    cor: 'pink',
    doses: [
      { id: '1a', label: '1ª Dose' },
      { id: '2a', label: '2ª Dose' },
    ],
  },
  {
    id: 'pneumo10',
    nome: 'Pneumocócica 10V (conjugada)',
    cor: 'yellow',
    doses: [
      { id: '1a', label: '1ª Dose' },
      { id: '2a', label: '2ª Dose' },
    ],
  },
  {
    id: 'vip',
    nome: 'VIP',
    cor: 'blue',
    doses: [
      { id: '1a', label: '1ª Dose' },
      { id: '2a', label: '2ª Dose' },
      { id: '3a', label: '3ª Dose' },
    ],
  },
  {
    id: 'meningo-c',
    nome: 'Meningocócica C (conjugada)',
    cor: 'cyan',
    doses: [
      { id: '1a', label: '1ª Dose' },
      { id: '2a', label: '2ª Dose' },
    ],
  },
  {
    id: 'febre-amarela',
    nome: 'Febre Amarela',
    cor: 'green',
    doses: [
      { id: '1a', label: '1ª Dose' },
    ],
  },
  {
    id: 'triplice-viral',
    nome: 'Tríplice Viral',
    cor: 'purple',
    doses: [
      { id: '1a', label: '1ª Dose' },
    ],
  },
  {
    id: 'covid19',
    nome: 'COVID-19',
    cor: 'stone',
    doses: [
      { id: '1a', label: '1ª Dose' },
      { id: '2a', label: '2ª Dose' },
      { id: '3a', label: '3ª Dose' },
    ],
  },
]

export const CORES_VACINA: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  indigo:  { border: 'border-indigo-400',  bg: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-400'  },
  orange:  { border: 'border-orange-400',  bg: 'bg-orange-50',  text: 'text-orange-700',  dot: 'bg-orange-400'  },
  pink:    { border: 'border-pink-400',    bg: 'bg-pink-50',    text: 'text-pink-700',    dot: 'bg-pink-400'    },
  red:     { border: 'border-red-400',     bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400'     },
  blue:    { border: 'border-blue-400',    bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400'    },
  yellow:  { border: 'border-yellow-400',  bg: 'bg-yellow-50',  text: 'text-yellow-700',  dot: 'bg-yellow-400'  },
  cyan:    { border: 'border-cyan-400',    bg: 'bg-cyan-50',    text: 'text-cyan-700',    dot: 'bg-cyan-400'    },
  green:   { border: 'border-green-400',   bg: 'bg-green-50',   text: 'text-green-700',   dot: 'bg-green-400'   },
  purple:  { border: 'border-purple-400',  bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-400'  },
  teal:    { border: 'border-teal-400',    bg: 'bg-teal-50',    text: 'text-teal-700',    dot: 'bg-teal-400'    },
  amber:   { border: 'border-amber-400',   bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400'   },
  rose:    { border: 'border-rose-400',    bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-400'    },
  sky:     { border: 'border-sky-400',     bg: 'bg-sky-50',     text: 'text-sky-700',     dot: 'bg-sky-400'     },
  fuchsia: { border: 'border-fuchsia-400', bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', dot: 'bg-fuchsia-400' },
  slate:   { border: 'border-slate-400',   bg: 'bg-slate-50',   text: 'text-slate-700',   dot: 'bg-slate-400'   },
  stone:   { border: 'border-stone-400',   bg: 'bg-stone-50',   text: 'text-stone-700',   dot: 'bg-stone-400'   },
}
