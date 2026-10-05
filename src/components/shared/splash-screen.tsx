"use client";

import { useEffect } from "react";
import Image from "next/image";

interface SplashScreenProps {
  onComplete?: () => void;
  durationMs?: number;
}

export default function SplashScreen({
  onComplete,
  durationMs = 3000,
}: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0C1116] overflow-hidden animate-in fade-in duration-300">
      {/* Background Ellipses matching auth theme */}
      <div className="absolute w-[500px] h-[500px] bg-[#6887A0]/10 rounded-full blur-3xl pointer-events-none" />
      <Image
        src="/images/auth-ellipse.png"
        alt=""
        fill
        className="object-cover pointer-events-none z-0 opacity-40"
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated Logo Video */}
        <div className="w-[260px] sm:w-[340px] flex items-center justify-center">
          <video
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={() => onComplete?.()}
            className="w-full h-auto object-contain"
          >
            <source
              src="/Annuity_Vault_transparent.webm"
              type="video/webm"
            />
            <source src="/annuity-vault.mov" />
          </video>
        </div>

        {/* Loading Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#6887A0] animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#6887A0] animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#6887A0] animate-bounce" />
        </div>
      </div>
    </div>
  );
}
