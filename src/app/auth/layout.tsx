export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full h-screen min-h-[650px] bg-[#0C1116] overflow-hidden flex items-center justify-center p-6 lg:p-12">
      {/* Background Image & Gradient Overlays */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-75 z-0"
        style={{ backgroundImage: `url('/images/auth-bg.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#141C24]/20 to-[#394A58]/20 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_44%_50%,transparent_0%,rgba(0,0,0,0.45)_100%)] z-0" />

      {/* Left Quote Section */}
      <div className="absolute left-8 lg:left-16 bottom-10 lg:bottom-14 max-w-[420px] z-10">
        <p className="text-lg lg:text-xl font-normal leading-[1.3] tracking-[-0.014em] text-white capitalize font-sans drop-shadow-md">
          &quot;A Secure, Centralized Platform For Managing Your Clients&apos; Annuity Contracts &mdash; From Purchase To Annuitization.&quot;
        </p>
      </div>

      {/* Page Content */}
      <div className="relative z-10 w-full h-full flex justify-end">
        {children}
      </div>
    </div>
  );
}
