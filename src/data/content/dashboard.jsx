import React from 'react';
import { Brain, Dna, HeartPulse } from 'lucide-react';

export const dashboardData = [
  {
    id: 0,
    category: 'Nervensystem',
    icon: <Brain className="w-4 h-4" />,
    metrics: [
      {
        label: 'HRV (ms)',
        unit: 'ms',
        description:
          'Die Herzratenvariabilität misst die zeitlichen Abstände zwischen Herzschlägen. Ein hoher Wert signalisiert starke Erholung, hohe Stressresistenz und ein dominantes parasympathisches Nervensystem.',
        segments: [
          {
            width: '20%',
            color: 'bg-red-900/40',
            label: '< 25',
            topLabel: 'Suboptimal',
          },
          {
            width: '15%',
            color: 'bg-white/5',
            label: '25-45',
            topLabel: 'Basis',
          },
          {
            width: '35%',
            color: 'bg-[#E5D9B6]',
            label: '45-85',
            topLabel: 'Optimum',
            isOptimum: true,
          },
          {
            width: '20%',
            color: 'bg-white/5',
            label: '85-110',
            topLabel: 'Basis',
          },
          {
            width: '10%',
            color: 'bg-red-900/40',
            label: '> 110',
            topLabel: 'Suboptimal',
          },
        ],
      },
      {
        label: 'RHR (bpm)',
        unit: 'bpm',
        inverted: true,
        description:
          'Der Ruhepuls ist ein Basis-Indikator für aerobe Fitness und Herzgesundheit. Niedrigere Werte deuten auf ein effizientes Herz und gute kardiovaskuläre Ökonomie hin.',
        segments: [
          {
            width: '20%',
            color: 'bg-red-900/40',
            label: '< 40',
            topLabel: 'Suboptimal',
          },
          {
            width: '15%',
            color: 'bg-white/5',
            label: '40-48',
            topLabel: 'Basis',
          },
          {
            width: '25%',
            color: 'bg-[#E5D9B6]',
            label: '48-58',
            topLabel: 'Optimum',
            isOptimum: true,
          },
          {
            width: '20%',
            color: 'bg-white/5',
            label: '58-70',
            topLabel: 'Basis',
          },
          {
            width: '20%',
            color: 'bg-red-900/40',
            label: '> 70',
            topLabel: 'Suboptimal',
          },
        ],
      },
      {
        label: 'Sleep Eff. (%)',
        unit: '%',
        description:
          'Die Schlafeffizienz beschreibt den prozentualen Anteil der Schlafzeit an der gesamten Zeit im Bett. Werte über 88% stehen für minimale Wachphasen und hohe Schlafqualität.',
        segments: [
          {
            width: '15%',
            color: 'bg-red-900/40',
            label: '< 80',
            topLabel: 'Suboptimal',
          },
          {
            width: '20%',
            color: 'bg-white/5',
            label: '80-88',
            topLabel: 'Basis',
          },
          {
            width: '30%',
            color: 'bg-[#E5D9B6]',
            label: '88-96',
            topLabel: 'Optimum',
            isOptimum: true,
          },
          {
            width: '20%',
            color: 'bg-white/5',
            label: '96-98',
            topLabel: 'Basis',
          },
          {
            width: '15%',
            color: 'bg-red-900/40',
            label: '> 98',
            topLabel: 'Suboptimal',
          },
        ],
      },
    ],
  },
  {
    id: 1,
    category: 'Biochemie',
    icon: <Dna className="w-4 h-4" />,
    metrics: [
      {
        label: 'Cortisol (nmol/L)',
        unit: 'nmol/L',
        description:
          'Das primäre Stresshormon. Das Optimum (350-550 nmol/L) am Morgen sorgt für Energie und Fokus. Chronisch erhöhte Werte blockieren die Fettverbrennung und Regeneration.',
        segments: [
          {
            width: '15%',
            color: 'bg-red-900/40',
            label: '< 140',
            topLabel: 'Suboptimal',
          },
          {
            width: '20%',
            color: 'bg-white/5',
            label: '140 - 250',
            topLabel: 'Basis',
          },
          {
            width: '30%',
            color: 'bg-[#E5D9B6]',
            label: '350 - 550',
            topLabel: 'Optimum',
            isOptimum: true,
          },
          {
            width: '20%',
            color: 'bg-white/5',
            label: '550 - 700',
            topLabel: 'Basis',
          },
          {
            width: '15%',
            color: 'bg-red-900/40',
            label: '> 750',
            topLabel: 'Suboptimal',
          },
        ],
      },
      {
        label: 'hs-CRP (mg/L)',
        unit: 'mg/L',
        description:
          'High-sensitivity C-Reactive Protein misst systemische Entzündungen im Körper. Niedrige Werte sind entscheidend für Gefäßgesundheit und schnelle Regeneration nach Belastung.',
        segments: [
          {
            width: '15%',
            color: 'bg-red-900/40',
            label: '< 0.1',
            topLabel: 'Suboptimal',
          },
          {
            width: '20%',
            color: 'bg-white/5',
            label: '0.1 - 0.5',
            topLabel: 'Basis',
          },
          {
            width: '30%',
            color: 'bg-[#E5D9B6]',
            label: '< 0.8',
            topLabel: 'Optimum',
            isOptimum: true,
          },
          {
            width: '20%',
            color: 'bg-white/5',
            label: '1.0 - 2.5',
            topLabel: 'Basis',
          },
          {
            width: '15%',
            color: 'bg-red-900/40',
            label: '> 3.0',
            topLabel: 'Suboptimal',
          },
        ],
      },
      {
        label: 'T/C Ratio',
        unit: null,
        description:
          'Das Testosteron-Cortisol-Verhältnis zeigt die Balance zwischen Aufbau (Anabol) und Abbau (Katabol). Ein hohes Verhältnis ist essenziell für Muskelaufbau und positive Trainingsadaption.',
        segments: [
          {
            width: '15%',
            color: 'bg-red-900/40',
            label: '< 0.015',
            topLabel: 'Suboptimal',
          },
          {
            width: '20%',
            color: 'bg-white/5',
            label: '0.015 - 0.025',
            topLabel: 'Basis',
          },
          {
            width: '30%',
            color: 'bg-[#E5D9B6]',
            label: '> 0.035',
            topLabel: 'Optimum',
            isOptimum: true,
          },
          {
            width: '20%',
            color: 'bg-white/5',
            label: '0.050 - 0.070',
            topLabel: 'Basis',
          },
          {
            width: '15%',
            color: 'bg-red-900/40',
            label: '> 0.080',
            topLabel: 'Suboptimal',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    category: 'Metabolik',
    icon: <HeartPulse className="w-4 h-4" />,
    metrics: [
      {
        label: 'ApoB (mg/dL)',
        unit: 'mg/dL',
        description:
          'Apolipoprotein B erfasst die Gesamtlast atherogener Partikel. Es ist präziser als LDL-Cholesterin zur Vorhersage kardiovaskulärer Risiken. Ziel: So niedrig wie möglich.',
        segments: [
          {
            width: '15%',
            color: 'bg-red-900/40',
            label: '< 40',
            topLabel: 'Suboptimal',
          },
          {
            width: '20%',
            color: 'bg-white/5',
            label: '40 - 60',
            topLabel: 'Basis',
          },
          {
            width: '30%',
            color: 'bg-[#E5D9B6]',
            label: '< 65',
            topLabel: 'Optimum',
            isOptimum: true,
          },
          {
            width: '20%',
            color: 'bg-white/5',
            label: '80 - 100',
            topLabel: 'Basis',
          },
          {
            width: '15%',
            color: 'bg-red-900/40',
            label: '> 110',
            topLabel: 'Suboptimal',
          },
        ],
      },
      {
        label: 'Insulin-Sens.',
        unit: null,
        description:
          'Maß dafür, wie effektiv Zellen Glukose aufnehmen. Hohe Sensitivität verhindert Energieschwankungen, reduziert Entzündungen und begünstigt die Fettverbrennung.',
        segments: [
          {
            width: '15%',
            color: 'bg-red-900/40',
            label: '< 0.5',
            topLabel: 'Suboptimal',
          },
          {
            width: '20%',
            color: 'bg-white/5',
            label: '0.5 - 0.8',
            topLabel: 'Basis',
          },
          {
            width: '30%',
            color: 'bg-[#E5D9B6]',
            label: '1.0 - 1.5',
            topLabel: 'Optimum',
            isOptimum: true,
          },
          {
            width: '20%',
            color: 'bg-white/5',
            label: '2.0 - 2.4',
            topLabel: 'Basis',
          },
          {
            width: '15%',
            color: 'bg-red-900/40',
            label: '> 2.5',
            topLabel: 'Suboptimal',
          },
        ],
      },
      {
        label: 'TSH (mU/L)',
        unit: 'mU/L',
        description:
          'Thyreoidea-stimulierendes Hormon steuert die Schilddrüse. Der optimale Bereich sichert einen hohen Grundumsatz, Thermogenese und mentale Wachheit.',
        segments: [
          {
            width: '15%',
            color: 'bg-red-900/40',
            label: '< 0.3',
            topLabel: 'Suboptimal',
          },
          {
            width: '20%',
            color: 'bg-white/5',
            label: '0.3 - 1.0',
            topLabel: 'Basis',
          },
          {
            width: '30%',
            color: 'bg-[#E5D9B6]',
            label: '1.2 - 2.0',
            topLabel: 'Optimum',
            isOptimum: true,
          },
          {
            width: '20%',
            color: 'bg-white/5',
            label: '2.5 - 4.0',
            topLabel: 'Basis',
          },
          {
            width: '15%',
            color: 'bg-red-900/40',
            label: '> 4.5',
            topLabel: 'Suboptimal',
          },
        ],
      },
    ],
  },
];

