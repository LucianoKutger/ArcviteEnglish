const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const projectRoot = path.resolve(__dirname, '..');
const assetsRoot = path.join(projectRoot, 'src', 'assets');
const outputRoot = path.join(assetsRoot, 'optimized');

const imageGroups = [
  {
    directory: 'biosync',
    widths: [320, 640, 960],
    avif: { quality: 55, effort: 5, chromaSubsampling: '4:4:4' },
    webp: { quality: 80, effort: 5, smartSubsample: true },
    images: [
      ['BiometricHub.png', 'biometric-hub'],
      ['ClinicalLab.png', 'clinical-lab'],
      ['GeneAnalysis.png', 'gene-analysis'],
      ['DataFusion.jpg', 'data-fusion'],
    ],
  },
  {
    directory: 'protocols',
    widths: [320, 640, 960, 1280, 1600],
    avif: { quality: 55, effort: 5, chromaSubsampling: '4:4:4' },
    webp: { quality: 80, effort: 5, smartSubsample: true },
    images: [
      ['FullSpec1.png', 'full-spec-1'],
      ['FullSpec2.png', 'full-spec-2'],
      ['FullSpec3.png', 'full-spec-3'],
      ['FullSpec4.png', 'full-spec-4'],
      ['FullSpec5.png', 'full-spec-5'],
      ['FullSpec6.png', 'full-spec-6'],
    ],
  },
  {
    directory: 'founder',
    widths: [320, 640, 960],
    avif: { quality: 60, effort: 5, chromaSubsampling: '4:4:4' },
    webp: { quality: 82, effort: 5, smartSubsample: true },
    images: [['founderPic.png', 'founder']],
  },
];

const logoGroup = {
  directory: 'logo',
  widths: [170, 340],
  images: [['ArcviteLogoPic.png', 'arcvite-logo']],
};

async function assertInputExists(inputPath) {
  try {
    await fs.access(inputPath);
  } catch {
    throw new Error(`Missing source image: ${path.relative(projectRoot, inputPath)}`);
  }
}

async function writeVariant(inputPath, outputPath, width, format, options) {
  await sharp(inputPath)
    .rotate()
    .resize({
      width,
      fit: 'inside',
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    })
    [format](options)
    .toFile(outputPath);
}

async function generateGroup(group) {
  const directory = path.join(outputRoot, group.directory);
  await fs.mkdir(directory, { recursive: true });

  for (const [sourceName, outputName] of group.images) {
    const inputPath = path.join(assetsRoot, sourceName);
    await assertInputExists(inputPath);
    const metadata = await sharp(inputPath).metadata();

    for (const width of group.widths.filter((value) => value <= metadata.width)) {
      await writeVariant(
        inputPath,
        path.join(directory, `${outputName}-${width}.avif`),
        width,
        'avif',
        group.avif,
      );
      await writeVariant(
        inputPath,
        path.join(directory, `${outputName}-${width}.webp`),
        width,
        'webp',
        group.webp,
      );
    }
  }
}

async function generateLogo() {
  const directory = path.join(outputRoot, logoGroup.directory);
  await fs.mkdir(directory, { recursive: true });

  for (const [sourceName, outputName] of logoGroup.images) {
    const inputPath = path.join(assetsRoot, sourceName);
    await assertInputExists(inputPath);
    const metadata = await sharp(inputPath).metadata();

    for (const width of logoGroup.widths.filter((value) => value <= metadata.width)) {
      await writeVariant(
        inputPath,
        path.join(directory, `${outputName}-${width}.webp`),
        width,
        'webp',
        { lossless: true, effort: 6 },
      );
    }
  }
}

async function main() {
  for (const group of imageGroups) {
    await generateGroup(group);
  }
  await generateLogo();
  console.log(`Responsive images generated in ${path.relative(projectRoot, outputRoot)}`);
}

main().catch((error) => {
  console.error(`Responsive image generation failed: ${error.message}`);
  process.exitCode = 1;
});
