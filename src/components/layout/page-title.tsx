/**
 * The page's <title>. React places it in the document head, so it is in the
 * server-rendered HTML and follows client navigation. Render exactly one per page.
 */
export function PageTitle({ title }: { title?: string | null }) {
  return <title>{title ? `${title} · PetBuddy` : "PetBuddy: pet care, close to home"}</title>;
}
