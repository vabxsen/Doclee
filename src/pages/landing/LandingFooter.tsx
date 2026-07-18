import { Link } from 'react-router-dom'
import { FileImage, ShieldCheck } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'

export function LandingFooter() {
  return (
    <footer className="border-t border-border-glass">
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-[8px] bg-white text-black">
                <FileImage className="size-4" strokeWidth={2.25} />
              </span>
              <span className="text-sm font-semibold text-ink">{APP_NAME}</span>
            </div>
            <p className="mt-3 flex max-w-xs items-start gap-1.5 text-xs text-ink-muted">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
              Everything runs on your device. No account, no image ever leaves your browser unless
              you export or share it yourself.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Product</p>
              <ul className="flex flex-col gap-1.5 text-sm text-ink-muted">
                <li>
                  <Link to="/tools/image-to-pdf" className="hover:text-ink">
                    Image to PDF
                  </Link>
                </li>
                <li>
                  <a href="#tools" className="hover:text-ink">
                    All tools
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border-glass pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p>Built for people who care about quality.</p>
        </div>
      </div>
    </footer>
  )
}
