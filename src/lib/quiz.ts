// Quiz de entrada do app Aprenda a Tabuada (antigo Base Certa). Texto aprovado em PLANEJAMENTO/02-QUIZ.txt.
// Quem responde é o pai (ou a mãe, ou outro responsável). Substitui a antiga senha.

export interface QuizQuestion {
  id: string // vira o nome da coluna na planilha
  text: string
  helper?: string
  options: string[]
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: 'quem_responde', text: 'Quem está respondendo?', options: ['Pai', 'Mãe', 'Outro responsável'] },
  { id: 'filhos', text: 'Quantos filhos você tem?', options: ['1', '2', '3 ou mais'] },
  {
    id: 'idade_filho',
    text: 'Quantos anos tem o filho que vai usar o app?',
    helper: 'Se for mais de um, pense em um só por enquanto.',
    options: ['Até 7', '8 a 10', '11 a 13', '14 a 17', '18 ou mais'],
  },
  {
    id: 'matematica_filho',
    text: 'Como ele está em matemática hoje?',
    options: ['Vai bem', 'Vai passando, mas sem o básico bem construído', 'Tem dificuldade e sabe disso', 'Tem dificuldade e já desanimou'],
  },
  {
    id: 'tabuada_filho',
    text: 'E a tabuada, como está?',
    options: ['Sabe de cabeça', 'Sabe algumas e conta nos dedos nas outras', 'Não sabe e foge dela', 'Não sei dizer'],
  },
  {
    id: 'matematica_pai',
    text: 'E você, como se dava com a matemática na escola?',
    options: ['Ia bem', 'Ia levando', 'Tinha dificuldade', 'Até hoje tenho dificuldade'],
  },
  {
    id: 'dever',
    text: 'Quando ele trava num dever de matemática, o que costuma acontecer?',
    options: [
      'Eu sento e ajudo',
      'Quero ajudar, mas não sei explicar',
      'Outra pessoa ajuda',
      'Ele resolve sozinho ou deixa em branco',
      'Não fico sabendo',
    ],
  },
  {
    id: 'alfabeto',
    text: 'Eu costumo dizer que a tabuada é o alfabeto da matemática. Você concorda?',
    options: ['Concordo, sem ela o resto trava', 'Em parte', 'Não, hoje tem calculadora para isso', 'Nunca tinha pensado nisso'],
  },
  {
    id: 'preocupacao',
    text: 'O que mais te preocupa hoje?',
    options: ['Ele ficar para trás na escola', 'Ele passar de ano sem aprender', 'Ele achar que não é capaz', 'Eu não conseguir ajudar'],
  },
  {
    id: 'tempo_pratica',
    text: 'Quanto tempo por dia ele consegue praticar?',
    options: ['5 minutos', '10 a 15 minutos', '30 minutos ou mais', 'Não sei'],
  },
]

export type QuizAnswers = Record<string, string>

// Monta o "por onde começar" a partir das perguntas 3 (idade), 5 (tabuada) e 10 (tempo).
// Cada item vira um parágrafo na tela; na planilha, vão juntos numa célula.
export function buildStartAdvice(a: QuizAnswers): string[] {
  // [o começo, o detalhe]: uma frase curta em destaque e o detalhe na linha de baixo
  const start: Record<string, [string, string]> = {
    'Sabe de cabeça': ['todas as tabuadas juntas, no nível Desafiador', 'Assim ela continua afiada.'],
    'Sabe algumas e conta nos dedos nas outras': [
      'a tabuada no nível Iniciante',
      'Um número por vez, começando pelos que ele ainda conta nos dedos.',
    ],
    'Não sabe e foge dela': ['a tabuada no nível Iniciante', 'Um número por vez, começando pelo 2.'],
    'Não sei dizer': [
      'uma rodada com todas as tabuadas juntas, no nível Iniciante',
      'Fica do lado dele, pra ver quais ele já sabe e quais ainda não.',
    ],
  }
  const time: Record<string, string> = {
    '5 minutos': 'Cinco minutos por dia já bastam pra começar.',
    '10 a 15 minutos': 'Uns 10 minutos por dia, sempre no mesmo horário.',
    '30 minutos ou mais': 'Não precisa de tudo isso: 10 a 15 minutos por dia, sem pular dia, rendem mais.',
    'Não sei': 'Uns 10 minutos por dia, sempre no mesmo horário.',
  }

  const [comeco, detalhe] = start[a.tabuada_filho] ?? start['Não sei dizer']
  const parts = [
    `Pelo que você contou, o melhor começo é ${comeco}.`,
    detalhe,
    time[a.tempo_pratica] ?? time['Não sei'],
  ]
  if (['11 a 13', '14 a 17', '18 ou mais'].includes(a.idade_filho)) {
    parts.push('Quando a tabuada estiver fixa na memória, vale passar pros Números Inteiros.')
    parts.push('A escola começa a ensinar no 6º ano.')
  }
  return parts
}


// ---------- Contato ----------

export function onlyDigits(s: string): string {
  return s.replace(/\D/g, '')
}

// (22) 99222-5709
export function formatPhone(s: string): string {
  const d = onlyDigits(s).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

// Celular brasileiro: DDD + 9 + 8 dígitos = 11 dígitos
export function isValidPhone(s: string): boolean {
  const d = onlyDigits(s)
  return d.length === 11 && d[2] === '9' && d[0] !== '0'
}

export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim())
}

// ---------- Envio para a planilha ----------
// Endereço do script do Google (Apps Script) que grava na planilha do quiz.
// Fica na variável de ambiente NEXT_PUBLIC_QUIZ_SHEET_URL (na Vercel e no .env.local).
// Passo a passo: PLANEJAMENTO/06-PLANILHA-COMO-INSTALAR.txt

export interface QuizSubmission {
  nome: string
  email: string
  celular: string
  aceite: boolean
  answers: QuizAnswers
  resultado: string
}

export async function sendToSheet(s: QuizSubmission): Promise<void> {
  const url = process.env.NEXT_PUBLIC_QUIZ_SHEET_URL
  if (!url) {
    console.warn('NEXT_PUBLIC_QUIZ_SHEET_URL não configurada: respostas do quiz não foram enviadas.')
    return
  }
  const body = JSON.stringify({
    data: new Date().toISOString(),
    origem: 'base-certa',
    nome: s.nome.trim().slice(0, 80),
    email: s.email.trim().toLowerCase(),
    celular: onlyDigits(s.celular),
    aceite: s.aceite ? 'sim' : 'não',
    ...s.answers,
    resultado: s.resultado,
  })

  // O pai nunca fica preso na porta: no máximo 4 segundos esperando a planilha.
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, 4000))
  const send = fetch(url, {
    method: 'POST',
    mode: 'no-cors', // o Apps Script não responde CORS; o envio acontece mesmo assim
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body,
  })
    .then(() => undefined)
    .catch((err) => console.warn('Falha ao enviar o quiz para a planilha:', err))

  await Promise.race([send, timeout])
}
