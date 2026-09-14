import type { FaqItem } from '@/lib/data/faqs'

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-lab-line panel">
      {items.map((item) => (
        <details key={item.question} className="group px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-lab-text marker:content-none">
            {item.question}
            <span
              aria-hidden="true"
              className="text-lab-accent transition group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-lab-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}
