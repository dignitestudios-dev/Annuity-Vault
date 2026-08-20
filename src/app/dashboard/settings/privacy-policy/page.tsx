export default function SettingsPrivacyPolicyPage() {
  return (
    <div className="w-full flex flex-col font-sans">
      <div className="flex flex-col gap-1 pb-4 border-b border-[#333333] mb-6">
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          Privacy Policy
        </h2>
        <p className="text-xs text-[#919191]">
          Last updated: August 2026
        </p>
      </div>

      <div className="flex flex-col gap-6 text-sm text-[#919191] leading-relaxed max-w-[860px]">
        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-white">1. Introduction</h3>
          <p>
            Welcome to Annuity Vault. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices regarding your personal information, please contact our support team.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-white">2. Information We Collect</h3>
          <p>
            We collect personal information that you provide to us when you register on the platform, express an interest in obtaining information about us or our products and services, when you participate in activities on the platform, or otherwise when you contact us.
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-[#919191]">
            <li>Personal Identifiers (Name, Email, Phone Number, Firm Name)</li>
            <li>Authentication and Security Credentials (Passwords, 2FA tokens)</li>
            <li>Client Financial and Contract Metadata (Annuity records, policy documents)</li>
            <li>Usage & Analytics Data (Log files, device info, browser types)</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-white">3. How We Use Your Information</h3>
          <p>
            We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent. Specifically:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-[#919191]">
            <li>To facilitate account creation and logon processes.</li>
            <li>To deliver and manage annuity tracking, calendar synchronizations, and notifications.</li>
            <li>To protect our Services, perform audit logging, and prevent fraud.</li>
            <li>To respond to user inquiries and offer platform customer support.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-white">4. Data Protection & Security</h3>
          <p>
            We have implemented appropriate technical and organizational security measures, including 256-bit AES encryption at rest and TLS encryption in transit, designed to protect the security of any personal information we process.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-white">5. Contact Us</h3>
          <p>
            If you have questions or comments about this policy, you may email us at <span className="text-[#6887A0]">support@annuityvault.com</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
