interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  "aria-label"?: string;
}

export function NavLink({
  href,
  children,
  external = false,
  "aria-label": ariaLabel,
}: NavLinkProps) {
  const className =
    "group text-sm text-muted transition-colors hover:text-text focus-ring";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <a href={href} aria-label={ariaLabel} className={className}>
      {children}
    </a>
  );
}
