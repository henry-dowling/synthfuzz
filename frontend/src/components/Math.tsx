import katex from 'katex'
import 'katex/dist/katex.min.css'

type MathProps = {
  math: string
  block?: boolean
}

export function Math({ math, block = false }: MathProps) {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: block,
  })

  return (
    <span
      className={block ? 'block my-4' : ''}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
} 