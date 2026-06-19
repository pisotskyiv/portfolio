interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}

export function NavLink({ href, children, external = false }: NavLinkProps) {
  const className =
    "text-sm text-muted transition-colors hover:text-text focus-ring";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
