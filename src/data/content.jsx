import React from 'react';
import { Brain, Dna, HeartPulse } from 'lucide-react';
import { bioSyncImages, protocolImages } from './responsiveImages';

export const navItems = [
  { label: 'Vision', targetId: 'vision' },
  { label: 'The Arc', targetId: 'methodik' },
  { label: 'Science', targetId: 'studies' },
  { label: 'Our Founder', targetId: 'founder' },
  { label: 'Bio Snyc', targetId: 'biosync' },
  { label: 'Solutions', targetId: 'protokolle' },
  { label: 'FAQ', targetId: 'faq' },
];

export const solutions = [
  {
    id: 1,
    title: 'Asynchronous Execution',
    problem: 'No time for implementation',
    solution:
      'We work with rapid on-site implementation. You stay where you are. We come to you. The supplements, blueprints, and equipment arrive on your desk without you having to lift a finger.',
    details:
      'Our operational team takes over the complete management of your health logistics. From scheduling appointments with specialists to the just-in-time delivery of supplements and equipment – we act as an invisible interface that ensures all protocols are followed without you having to adjust your agenda. This also includes proactive communication with your existing medical infrastructure.',
    image: protocolImages[0],
  },
  {
    id: 2,
    title: 'Cognitive Performance',
    problem: 'Cognitive noise & loss of focus',
    solution:
      'Elimination of inflammation and stabilization of neurochemistry. Constant mental sharpness for high-stakes decisions, regardless of the time of day.',
    details:
      'We use advanced neuro-feedback technologies and precisely tuned nootropic stacks to optimize your neurotransmitter balance. The goal is a state of lasting mental clarity and enhanced executive function, even during periods of high psychological stress.',
    image: protocolImages[1],
  },
  {
    id: 3,
    title: 'Biological Risk Management',
    problem: 'Incalculable biological failure risks',
    solution:
      'We manage your health like an investment portfolio. Through quarterly in-depth analyses (ApoB, HbA1c, hormones), our early warning systems detect risks before they jeopardize your operational capacity.',
    details:
      'Through the continuous monitoring of over 50 biomarkers, we create an early warning system that detects pathological developments long before symptoms appear. We manage your health with the same care and foresight as an institutional asset portfolio. This includes genetic predisposition analyses and epigenetic age tests.',
    image: protocolImages[2],
  },
  {
    id: 4,
    title: 'Adaptive Protocols',
    problem: 'Performance drop due to global mobility',
    solution:
      'Travel-specific approach. From jet lag protocols to precise restaurant briefings for business dinners – we dynamically adapt your biology to every time zone and every social scenario.',
    details:
      'Our system adapts to your lifestyle, not the other way around. We develop adaptive protocols for time zone changes, business trips, and irregular sleep cycles so that your physiological performance remains stable regardless of external factors.',
    image: protocolImages[3],
  },
  {
    id: 5,
    title: 'Privacy First',
    problem: 'Sensitive health data',
    solution:
      'Highest discretion at a family office level. Your data remains anonymized, encrypted, and never leaves our protected loop.',
    details:
      'Your data is stored in a private, isolated cloud infrastructure and is only accessible to our core medical team. We guarantee absolute discretion and security. No cloud backups with third-party providers, full sovereignty over your biological data.',
    image: protocolImages[4],
  },
  {
    id: 6,
    title: 'Growth Bottleneck',
    problem: 'Biological limit as a growth inhibitor',
    solution:
      'We transform your biology from an unpredictable variable into your strongest multiplier. By maximizing your energetic output, we create the foundation for boundless entrepreneurial scaling.',
    details:
      'Health is not a cost factor, but a lever for business success. By maximizing your physical and cognitive resources, we increase your decision-making capacity and resilience, which is directly reflected in your professional performance.',
    image: protocolImages[5],
  },
];
export const goalOptions = [
  { value: 'performance', label: 'Performance & Energy' },
  { value: 'longevity', label: 'Longevity & Healthspan' },
  { value: 'stress', label: 'Stress & Resilience' },
];

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

export const syncCardsData = [
  {
    id: 'Biometric Hub',
    title: 'Biometric Hub',
    category: 'Data Collection',
    focusTitle: 'Automatic Tracking 24/7',
    focusDesc:
      'Continuous tracking of autonomous stress capacity and analysis of your sleep architecture for maximum recovery precision',
    imageLabel: 'Biometric Hub',
    image: bioSyncImages.biometricHub,
    details: [
      'Automatic synchronization with dashboard',
      'Daily strain recommendation based on HRV',
      'Sleep phase analysis (REM/Deep)',
      'Long-term trend detection for recovery',
    ],
    appearance: 'foreground',
  },
  {
    id: 'Clinical Lab',
    title: 'Clinical Lab',
    category: 'Analysis',
    focusTitle: 'Metabolic Mapping',
    focusDesc:
      'Based on our timing system, we analyze 30+ biomarkers to guide performance, health, and longevity',
    imageLabel: 'Lab',
    image: bioSyncImages.clinicalLab,
    details: [
      'Quarterly blood sampling at your preferred location',
      'Comprehensive hormone panel (testosterone, cortisol)',
      'Cardiovascular risk analysis (ApoB, Lp(a))',
      'Detailed medical consultation',
    ],
    appearance: 'foreground',
  },
  {
    id: 'Gene Analysis',
    title: 'Gene Analysis',
    category: 'Genetic Baseline',
    focusTitle: '',
    focusDesc:
      'Decoding your genetic blueprint for the precise management of longevity and physical resilience',
    imageLabel: 'Genetic Profiling',
    image: bioSyncImages.geneAnalysis,
    details: [
      'Rate of aging',
      'Inflammation levels',
      'Immune capacity / Immune age',
    ],
    appearance: 'elevated',
  },
  {
    id: 'Data Fusion',
    title: 'Data Fusion',
    category: 'SYNTHESIS',
    focusTitle: 'Performance Synchronisation',
    focusDesc:
      'We aggregate all data streams into a coherent picture for maximum operational precision',
    imageLabel: 'Sync',
    image: bioSyncImages.dataFusion,
    details: [
      'End-to-end encrypted protocols',
      'Manual evaluation by performance specialists',
      'Correlation of blood values with sleep data',
      'Anonymized cloud infrastructure',
    ],
    appearance: 'elevated',

    wide: true,
  },
];
export const faqs = [
  {
    question: 'How much time does the implementation require?',
    answer:
      'Virtually none. Arcvite is not a course, but a turnkey installation. We come to you and implement the entire system (biometrics, supplements, equipment) on-site. You run your business – we optimize your biology in the background.',
  },
  {
    question: 'Is this program tax-deductible?',
    answer:
      'As a rule, yes. Since Arcvite serves as executive performance consulting to increase professional performance, it is usually fully recognized as a business expense or professional development. Effectively, the tax office thus finances up to 42% of your upgrade. Please speak briefly with your tax advisor about classifying it as performance consulting.',
  },
  {
    question: 'What happens if my health markers are extremely poor?',
    answer:
      'Then your potential is at its greatest. Arcvite does not work with estimates, but with hard data from your DNA and biometrics. The greater the current bottleneck in your biology, the more massive the leverage for your performance increase. We find the error in the system – and fix it.',
  },
  {
    question:
      'Do I only receive consulting, or do I also receive physical products?',
    answer:
      'You receive a turnkey, all-in-one system. Consulting alone does not solve biological bottlenecks. That is why the entire hardware arrives on your desk: the supplements tailored to your genetics, your technical blueprints, and the necessary high-end performance equipment. We provide not only the plan but also the tools for implementation.',
  },
  {
    question: 'What happens to my data? I value absolute discretion.',
    answer:
      "Arcvite is designed with 'Privacy First' in mind: All biometric profiles and DNA analyses are managed in encrypted form on autonomous servers. We do not sell any data and grant no third parties access. Your biology remains your private property – we are merely the architects of your optimization.",
  },
  {
    question: 'What is the first step?',
    answer:
      "A 15-minute performance audit. We don't sell you anything until we know if we can help you. In this conversation, we will analyze your status quo and verify if your system is ready for the Arcvite protocol. If it's a fit, you will receive a clear roadmap. If not, we will tell you directly.",
  },
  {
    question: 'Can I start the program at a later date?',
    answer:
      'Theoretically, yes. Practically, every week your system operates below its potential is a week of lost performance and clarity. Furthermore, our capacity for on-site implementations is strictly limited due to the high logistical effort involved. Requests are processed on a first-come, first-served basis. Once capacity is reached, we operate on a waiting list.',
  },
];

export const studiesData = [
  {
    id: 'study1',
    tag: 'BIOLOGICAL AGING',
    titlePre: 'THE',
    titleHighlight: 'RIBOSOMAL',
    titlePost: 'CLOCK',
    description:
      'Within the rDNA segment of the genome, Arcvite identifies epigenetic methylation as the most precise indicator of biological decline.',
    quote:
      'We measure the rate of biological decline against chronological time.',
    kpis: [
      {
        id: 1,
        value: '9%-69%',
        labelLine1: 'METHYLATION',
        labelLine2: 'SPECTRUM',
      },
      {
        id: 2,
        value: '15%',
        labelLine1: 'BASAL MINIMUM',
        labelLine2: 'METHYLATION',
      },
    ],
  },
  {
    id: 'study2',
    tag: 'CUSTOM HEALTH',
    titlePre: 'THE',
    titleHighlight: 'N-of-1',
    titlePost: 'APPROACH',
    description:
      'Instead of relying on imprecise population averages, Arcvite establishes a continuous, personalized data baseline. The Stanford study demonstrates that deep molecular anomalies and biological decline are only detected early through precise, longitudinal comparisons of the individual against themselves.',
    quote:
      'Standard averages fail because your body possesses its own unique molecular baseline."',
    kpis: [
      {
        id: 1,
        value: 'BLOOD TESTING',
        labelLine1: 'Tracking molecular trajectory over time',
      },
    ],
  },
  {
    id: 'study3',
    tag: 'COGNITIVE RESILIENCE ',
    titlePre: 'THE',
    titleHighlight: 'PHENOAGE',
    titlePost: 'METRIC',
    description:
      'True mental clarity is driven by systemic cellular health. Based on the groundbreaking PhenoAge matrix developed at Yale, Arcvite tracks the precise multi-system biomarkers that dictate your cognitive vitality. By monitoring and optimizing these core biological pillars, we systematically prevent mental fatigue and protect your executive processing speed.',
    quote:
      'We optimize the precise core pillars of human biology to keep your mind sharp and your biological age years below the calendar.',
    kpis: [
      { id: 1, value: '9', labelLine1: 'TARGETED', labelLine2: 'BIOMARKERS' },
      { id: 2, value: '14%', labelLine1: 'BRAIN', labelLine2: 'PERFORMANCE' },
    ],
  },
];

export const methodologySegments = [
  {
    id: 1,
    title: 'Core Effects',
    subtitle: 'The DNA of Performance',
    hex: '#2563EB',
    radius: 180,
    thickness: 6,
    description:
      'The psychological architecture of your success. This core works fully automatically in the background through our algorithms.',
    listItems: [
      {
        label: 'Regeneration cycle',
        text: 'The active management of sleep phases, circadian rhythm, and recovery protocols. It is the crucial pacemaker for your neuronal reset and the foundational prerequisite for cognitive precision as well as the control of your emotions.',
      },
      {
        label: 'Nutrient base',
        text: 'The fuel for your day. It determines whether your energy lasts until the evening or whether your focus drops prematurely. Without the right base, you risk an unnecessary drop in performance.',
      },
    ],
  },
  {
    id: 2,
    title: 'Neuro-Biochemistry',
    subtitle: 'Systemic Performance Base',
    hex: '#0EA5E9',
    radius: 300,
    thickness: 6,
    description:
      'The biochemical architecture of your body. Factors of internal performance capability that we can measurably optimize with modern science.',
    listItems: [
      {
        label: 'Hormone balance',
        text: 'The balance between stress adaptation and regeneration defines your emotional stability and physical presence under pressure.',
      },
      {
        label: 'Neurotransmitters',
        text: 'The quality of your cognitive signals. These messenger substances control your focus capacity, analytical sharpness, and impulse control in negotiation situations.',
      },
      {
        label: 'Inflammation',
        text: "The guardian of your biological capacity. Controlling systemic reactions eliminates cognitive brakes like 'brain fog' and safeguards your energy production against premature wear.",
      },
    ],
  },
  {
    id: 3,
    title: 'Operational Sphere',
    subtitle: 'Executive Ecosystem',
    hex: '#2DD4BF',
    radius: 420,
    thickness: 6,
    description:
      'The macroscopic perspective. The external forces and systemic variables that permanently impact your biology and psychology. Your system must not only endure these factors, but process them.',
    listItems: [
      {
        label: 'Unpredictable events',
        text: 'Global crises, black swan events, and sudden situations that cannot be planned for in advance and demand immediate adaptation from you.',
      },
      {
        label: 'Asymmetrical environment',
        text: 'An ecosystem characterized by chronic pressure. Deadlines, global mobility, and the continuous management of entrepreneurial risks.',
      },
      {
        label: 'High-pressure scenarios',
        text: 'Negotiation situations where emotional control, cognitive precision, and the right approach determine success or failure. Moments when uncontrolled emotional fluctuations directly threaten your judgment.',
      },
    ],
  },
  {
    id: 4,
    title: 'Dream',
    subtitle: 'Your Ultimate Vision',
    hex: '#5EEAD4',
    radius: 540,
    thickness: 6,
    description:
      'Your Polar Star. In the Arc Model, the dream is the highest authority according to which we align everything. It defines the guardrails for your Strategic Vision, your Neuro-Biochemistry, and your Core Effects. Everything follows the goal.',
    listItems: null,
  },
];
