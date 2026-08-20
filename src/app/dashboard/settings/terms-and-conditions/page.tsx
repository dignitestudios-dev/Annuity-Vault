export default function SettingsTermsPage() {
  return (
    <div className="w-full flex flex-col font-sans">
      <div className="flex flex-col gap-1 pb-4 border-b border-[#333333] mb-6">
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          Terms & Conditions
        </h2>
        <p className="text-xs text-[#919191]">
          Last updated: August 2026
        </p>
      </div>

      <div className="flex flex-col gap-6 text-sm text-[#919191] leading-relaxed max-w-[860px]">
        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-white">1. Agreement to Terms</h3>
          <p>
            These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity, and Annuity Vault, concerning your access to and use of the Annuity Vault platform and management tools.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-white">2. User Representations</h3>
          <p>
            By using the platform, you represent and warrant that:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-[#919191]">
            <li>All registration information you submit will be true, accurate, current, and complete.</li>
            <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
            <li>You have the legal capacity and you agree to comply with these Terms and Conditions.</li>
            <li>You will not access the platform through automated or non-human means without authorization.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-white">3. Intellectual Property Rights</h3>
          <p>
            Unless otherwise indicated, the platform is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the platform and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-white">4. User Account & Security</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and password. You agree to accept responsibility for all activities that occur under your account or password.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-white">5. Limitation of Liability</h3>
          <p>
            In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages arising from your use of the platform.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-white">6. Termination</h3>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms and Conditions.
          </p>
        </section>
      </div>
    </div>
  );
}
