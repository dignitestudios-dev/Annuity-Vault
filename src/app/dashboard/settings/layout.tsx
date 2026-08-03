export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <aside className="w-full md:w-64 flex-shrink-0">
        {/* Settings Navigation will go here */}
        <div className="font-semibold text-lg mb-4">Settings</div>
      </aside>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
