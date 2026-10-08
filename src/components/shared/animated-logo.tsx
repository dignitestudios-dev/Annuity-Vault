// "use client";

// import Image from "next/image";

// interface AnimatedLogoProps {
//   className?: string;
// }

// export default function AnimatedLogo({
//   className = "w-[140px] h-auto object-contain",
// }: AnimatedLogoProps) {
//   return (
//     <Image
//       src="/images/logo.png"
//       alt="Annuity Vault"
//       width={100}
//       height={100}
//       style={{ width: "auto", height: "auto" }}
//       className={className}
//       priority
//     />
//   );
// }
"use client";

interface AnimatedLogoProps {
  className?: string;
}

export default function AnimatedLogo({
  className = "w-full h-full object-contain",
}: AnimatedLogoProps) {
  return (
    <video
      src="/Annuity_Vault_white_lightblue.webm"
      autoPlay
      loop
      muted
      playsInline
      className={className}
    />
  );
}