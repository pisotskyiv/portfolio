import clsx from "clsx";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  target?: "_blank" | "_self";
  rel?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function Button({
  children,
  variant = "outline",
  size = "md",
  href,
  target,
  rel,
  onClick,
  disabled = false,
  type = "button",
}: ButtonProps) {
  const className = clsx(
    "inline-flex items-center font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    size === "sm" && "min-h-9 px-4 py-2 text-xs",
    size === "md" && "min-h-11 px-6 py-3 text-sm",
    size === "lg" && "min-h-12 px-8 py-4 text-base",
    variant === "solid" && "bg-accent text-text hover:bg-accent-hover",
    variant === "outline" &&
      "border border-accent bg-transparent text-accent hover:bg-accent/10",
    variant === "ghost" && "bg-transparent text-muted hover:text-text",
  );

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={className}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}
