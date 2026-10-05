"use client";

import Image from "next/image";

interface AnimatedLogoProps {
  className?: string;
}

export default function AnimatedLogo({
  className = "w-[140px] h-auto object-contain",
}: AnimatedLogoProps) {
  return (
    <Image
      src="/images/logo.png"
      alt="Annuity Vault"
      width={100}
      height={100}
      style={{ width: "auto", height: "auto" }}
      className={className}
      priority
    />
  );
}