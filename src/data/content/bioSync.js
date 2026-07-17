import { bioSyncImages } from '../responsiveImages';

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
