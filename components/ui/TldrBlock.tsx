interface TldrBlockProps {
  children: React.ReactNode;
}

export function TldrBlock({ children }: TldrBlockProps) {
  return (
    <div id="tldr" aria-label="TL;DR" className="border-l-2 border-accent bg-surface p-6">
      <p className="mb-2 font-mono text-xs uppercase tracking-label text-accent">TL;DR</p>
      <p className="text-sm leading-relaxed text-text md:text-base lg:text-lg">
        {children}
      </p>
    </div>
  );
}
