"use client";

export default function SettingsPrivacyPolicyPage() {
  return (
    <div className="w-full flex flex-col font-sans">
      <h2 className="text-2xl font-semibold text-white tracking-tight pb-4 border-b border-[#333333] mb-6">
        Privacy Policy
      </h2>

      <div className="flex flex-col gap-4 text-sm text-[#919191] leading-relaxed max-w-[800px]">
        <p>
          At Annuity Vault, we prioritize the protection and privacy of your financial advisory data and client records.
        </p>
        <h3 className="text-white font-semibold text-base pt-2">1. Data Collection</h3>
        <p>
          We collect account information, client directory entries, contract details, and system usage logs to deliver real-time notifications and anniversary tracking.
        </p>
        <h3 className="text-white font-semibold text-base pt-2">2. Data Security</h3>
        <p>
          All data at rest and in transit is encrypted using AES-256 standards with strict two-factor authentication and role-based access control.
        </p>
      </div>
    </div>
  );
}
