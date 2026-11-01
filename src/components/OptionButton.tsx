import { FeedbackState } from '@/lib/types'

interface OptionButtonProps {
  value: number
  feedback: FeedbackState
  isSelected: boolean
  isCorrect: boolean
  onClick: (value: number) => void
}

export default function OptionButton({
  value,
  feedback,
  isSelected,
  isCorrect,
  onClick,
}: OptionButtonProps) {
  const isDisabled = feedback !== 'idle'

  const size = String(value).length > 5 ? 'text-2xl' : 'text-3xl'
  let className =
    `w-full h-20 rounded-xl border-2 font-heading font-black ${size} flex items-center justify-center gap-2 transition-all duration-200 `
  let mark = ''

  if (feedback === 'idle') {
    className += 'bg-card border-line text-ink hover:border-ink cursor-pointer active:scale-95'
  } else if (isCorrect && (isSelected || feedback === 'wrong')) {
    className += 'bg-success-bg border-success text-success'
    mark = '✓'
    if (isSelected) className += ' anim-pop'
  } else if (isSelected && feedback === 'wrong') {
    className += 'bg-error-bg border-error text-error'
  } else {
    className += 'bg-card border-line text-ink opacity-40 cursor-default'
  }

  return (
    <button className={className} onClick={() => !isDisabled && onClick(value)} disabled={isDisabled}>
      <span>{value}</span>
      {mark && <span className="text-2xl">{mark}</span>}
    </button>
  )
}
