"use client";

import dynamic from "next/dynamic";

const FragmentedPortrait = dynamic(
  () =>
    import("@/components/ui/FragmentedPortrait").then(
      (m) => ({ default: m.FragmentedPortrait }),
    ),
  { ssr: false },
);

interface FragmentedPortraitClientProps {
  src: string;
  alt: string;
}

export function FragmentedPortraitClient({
  src,
  alt,
}: FragmentedPortraitClientProps) {
  return <FragmentedPortrait src={src} alt={alt} />;
}
