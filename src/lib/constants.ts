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

// Não é segurança de verdade — o app não tem servidor, então isso fica
// visível pra quem abrir o código-fonte no navegador. É só uma fricção
// honesta pra não deixar o link se espalhar sozinho (mesma lógica de um
// código na bio do Instagram).
export const ACCESS_PASSWORD = 'tododiaeuaprendo'

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
    color: 'purple',
  },
]
