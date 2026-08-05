"use client";

export default function SettingsTermsPage() {
  return (
    <div className="w-full flex flex-col font-sans">
      <h2 className="text-2xl font-semibold text-white tracking-tight pb-4 border-b border-[#333333] mb-6">
        Terms & Conditions
      </h2>

      <div className="flex flex-col gap-4 text-sm text-[#919191] leading-relaxed max-w-[800px]">
        <p>
          Welcome to Annuity Vault. By accessing or using our application, services, and platform, you agree to be bound by these Terms & Conditions.
        </p>
        <h3 className="text-white font-semibold text-base pt-2">1. Use of Services</h3>
        <p>
          Annuity Vault provides financial advisors with tools to manage annuity clients, contracts, tasks, and anniversaries. You are responsible for maintaining the confidentiality of your account credentials.
        </p>
        <h3 className="text-white font-semibold text-base pt-2">2. Data Privacy & Compliance</h3>
        <p>
          All client information stored on the platform is protected using enterprise-grade AES-256 encryption. Advisors must ensure compliance with applicable financial industry regulations.
        </p>
      </div>
    </div>
  );
}
