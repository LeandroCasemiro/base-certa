import { DifficultyConfig, ModeGroup } from './types'

export const MODE_GROUPS: ModeGroup[] = [
  {
    id: 'basic',
    label: 'Operações Básicas',
    modes: [
      { id: 'basic-add', label: 'Adição', icon: '+' },
      { id: 'basic-sub', label: 'Subtração', icon: '−' },
      { id: 'basic-mul', label: 'Multiplicação', icon: '×' },
      { id: 'basic-div', label: 'Divisão', icon: '÷' },
      { id: 'tabuada', label: 'Tabuada', icon: '★' },
    ],
  },
  {
    id: 'integers',
    label: 'Números Inteiros',
    modes: [
      { id: 'int-add', label: 'Adição', icon: '+' },
      { id: 'int-sub', label: 'Subtração', icon: '−' },
      { id: 'int-mul', label: 'Multiplicação', icon: '×' },
      { id: 'int-div', label: 'Divisão', icon: '÷' },
    ],
  },
]

export const QUESTIONS_PER_ROUND = 10

// ---- Quiz de entrada (substituiu a senha em 01/11/2026) ----

// WhatsApp Business "Pai MOVIDO". O botão no fim do quiz só aparece quando
// WHATSAPP_VIDEO_ENABLED = true. Ligar depois que o Vídeo 1 estiver gravado
// (ver PLANEJAMENTO/03-VIDEOS-WHATSAPP.txt).
export const WHATSAPP_NUMBER = '5522992225709'
export const WHATSAPP_VIDEO_ENABLED = false
export const WHATSAPP_MESSAGE = 'Oi Leandro, vim pelo app da tabuada e quero o vídeo.'

export const DIAGNOSTICO_URL = 'https://www.paimovido.com.br/diagnostico'
export const INSTAGRAM_URL = 'https://www.instagram.com/euleandrocasemiro/'
export const PRIVACY_URL = 'https://www.paimovido.com.br/politica-de-privacidade'

export const TABUADA_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1)

export const DIFFICULTY_LEVELS: DifficultyConfig[] = [
  {
    id: 'beginner',
    label: 'Iniciante',
    description: 'Números pequenos, sem pressão',
    color: 'green',
  },
  {
    id: 'intermediate',
    label: 'Desafiador',
    description: 'Números maiores, bom treino',
    color: 'blue',
  },
  {
    id: 'expert',
    label: 'Expert',
    description: 'Números grandes, máximo desafio',
    color: 'navy',
  },
]
