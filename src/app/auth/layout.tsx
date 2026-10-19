
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen min-h-[650px] w-full items-center justify-center overflow-hidden bg-[#0C1116] p-6 lg:p-12">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat "
        style={{ backgroundImage: "url('/images/auth-bg.png')" }}
      />

      {/* Base Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#141C24]/30 to-[#394A58]/30" />

      {/* Left-Side Readability Gradient */}
      <div className="absolute inset-y-0 left-0 z-[1] w-full bg-gradient-to-r from-black/65 via-black/35 to-transparent lg:w-[58%]" />

      {/* Overall Vignette */}
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_40%_50%,transparent_0%,rgba(0,0,0,0.3)_100%)]" />

      {/* Left Quote Section */}
      <div className="absolute left-6 top-[45%] z-10 max-w-[400px] -translate-y-1/2 sm:left-10 lg:left-16">
        {/* <div className="mb-5 h-1 w-14 rounded-full bg-[#86A7BE]" /> */}

        <p className="font-sans text-lg font-medium leading-[1.5] tracking-[-0.02em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-xl lg:text-[23px]">
          &quot;A Secure, Centralized Platform For Managing Your Clients&apos;
          Annuity Contracts &mdash; From Purchase To Annuitization.&quot;
        </p>
      </div>

      {/* Page Content */}
      <div className="relative z-10 flex h-full w-full justify-end">
        {children}
      </div>
    </div>
  );
}
