import SetupForm from "@/components/setup/SetupForm";

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-[#fdf6ee] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🥗</div>
          <h1 className="text-3xl font-900 text-[#3d2b0e] tracking-tight">
            NutriSathi
          </h1>
          <p className="text-[#a89070] mt-2 text-sm">
            Apna Indian diet tracker — Hindi, English, ya Hinglish mein boliye
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#fbebd8] rounded-[20px] shadow-[0_4px_24px_rgba(180,130,60,0.10)] p-8">
          <h2 className="text-xl font-800 text-[#3d2b0e] mb-6">
            Let&apos;s set up your profile
          </h2>
          <SetupForm />
        </div>
      </div>
    </div>
  );
}
