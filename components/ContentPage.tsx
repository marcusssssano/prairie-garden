// Shared shell for the footer's support/legal pages, so they all share
// one measure, heading rhythm, and spacing instead of each re-inventing
// a layout.
export default function ContentPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-sage-deep">
        {eyebrow}
      </span>
      <h1 className="mt-2 font-display text-3xl italic text-forest md:text-4xl">
        {title}
      </h1>
      {intro && (
        <p className="mt-4 font-body text-base leading-relaxed text-forest/80">
          {intro}
        </p>
      )}
      <div className="mt-10 space-y-8">{children}</div>
    </main>
  );
}

export function ContentSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-xl text-forest">{heading}</h2>
      <div className="mt-2 space-y-3 font-body text-sm leading-relaxed text-forest/70">
        {children}
      </div>
    </section>
  );
}
