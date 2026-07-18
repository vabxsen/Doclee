/** Reserves space at the end of scrollable pages so content isn't hidden behind the fixed mobile bottom nav. */
export function BottomNavSpacer() {
  return <div className="h-16 md:hidden" aria-hidden="true" />
}
