import {Storyboard} from './types';

// The only file you normally edit. Example: launch film for a fictional model "Nova 2",
// narrated in Indonesian. Scenes with `vo` and no `durationInFrames` size themselves to the narration.
export const storyboard: Storyboard = {
  fps: 30,
  transitionFrames: 12,
  audio: {
    music: 'generated',
    key: 'D',
    musicVolume: 0.55,
    duckTo: 0.35,
    sfx: true,
    sfxVolume: 0.5,
    voice: 'id-ID-ArdiNeural',
    voiceRate: '-4%',
    voiceVolume: 1,
  },
  scenes: [
    {
      type: 'headline',
      eyebrow: 'Memperkenalkan',
      lines: ['Inilah *Nova 2*'],
      sub: 'Model paling cerdas kami untuk coding, riset, dan kerja panjang.',
      vo: 'Inilah Nova dua. Model paling cerdas kami.',
    },
    {
      type: 'chat',
      durationInFrames: 180,
      title: 'Perbaiki layanan tagihan',
      assistantName: 'Nova 2',
      prompt: 'Cari kenapa invoice tertagih dua kali, lalu perbaiki.',
      response:
        'Ketemu. Handler retry mengirim ulang tagihan saat webhook timeout, tapi kunci idempotensinya dibuat ulang tiap percobaan.\n\nSudah saya pindahkan dan tambahkan tes regresi.',
      vo: 'Berikan masalah nyata, dan Nova menelusurinya sampai tuntas.',
    },
    {
      type: 'benchmark',
      eyebrow: 'Agentic coding',
      title: 'Terdepan di tugas rekayasa nyata',
      bars: [
        {label: 'Nova 2', value: 82.4, highlight: true},
        {label: 'Nova 1.5', value: 71.3},
        {label: 'Kompetitor A', value: 68.9},
        {label: 'Kompetitor B', value: 63.1},
      ],
      footnote: 'Angka ilustrasi untuk template.',
      vo: 'Di tolok ukur rekayasa perangkat lunak, Nova dua memimpin.',
    },
    {
      type: 'bigNumber',
      durationInFrames: 90,
      value: 7,
      suffix: ' jam',
      label: 'kerja mandiri dalam satu tugas',
    },
    {
      type: 'features',
      eyebrow: 'Yang baru',
      title: 'Dibuat untuk kerja panjang',
      items: [
        {title: 'Nalar lebih dalam', body: 'Merencanakan, memeriksa, merevisi.'},
        {title: 'Alat lebih tajam', body: 'Terminal, browser, dan file.'},
        {title: 'Ingatan lebih panjang', body: 'Konteks bertahan berjam-jam.'},
      ],
      vo: 'Nalar lebih dalam. Alat lebih tajam. Ingatan yang bertahan berjam-jam.',
    },
    {
      type: 'headline',
      tone: 'dark',
      lines: ['Kerjakan yang *terbaik*', 'bersama Nova 2'],
      vo: 'Kerjakan yang terbaik, bersama Nova dua.',
    },
    {
      type: 'logo',
      durationInFrames: 120,
      name: 'Nova',
      tagline: 'Tersedia hari ini',
      cta: 'nova.example.com',
    },
  ],
};
