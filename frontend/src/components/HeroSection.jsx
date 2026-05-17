const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-linear-to-b from-white via-gray-50 to-white overflow-hidden">

      {/* Soft background blur blobs */}
      <div className="absolute w-100 h-100 bg-purple-200 blur-[140px] -top-30 -left-30 opacity-50" />
      <div className="absolute w-100 h-100 bg-cyan-200 blur-[140px] -bottom-30 -right-30 opacity-50" />

      {/* Floating chat bubbles - left */}
      <div className="hidden md:flex absolute left-10 top-1/3 flex-col gap-4">
        <div className="bg-white/70 backdrop-blur-md border border-gray-200 px-4 py-2 rounded-2xl text-sm shadow-sm">
          👋 Hey, are you there?
        </div>
        <div className="bg-purple-100 border border-purple-200 px-4 py-2 rounded-2xl text-sm ml-6 shadow-sm">
          Yes! Let’s chat 🚀
        </div>
      </div>

      {/* Floating chat bubbles - right */}
      <div className="hidden md:flex absolute right-10 top-1/3 flex-col gap-4 items-end">
        <div className="bg-cyan-100 border border-cyan-200 px-4 py-2 rounded-2xl text-sm shadow-sm">
          🔥 This app is so clean!
        </div>
        <div className="bg-white/70 backdrop-blur-md border border-gray-200 px-4 py-2 rounded-2xl text-sm mr-6 shadow-sm">
          Real-time chat feels smooth ⚡
        </div>
      </div>

      {/* Center Content */}
      <div className="relative z-10 text-center max-w-3xl px-6">

        {/* Logo badge */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 flex items-center justify-center text-xl shadow-sm">
            💬
          </div>
        </div>

        {/* Big Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
          Chat instantly with{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-cyan-500">
            anyone, anywhere
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-gray-600 text-base md:text-lg">
          A simple, fast and modern chat application built for real-time communication.
          Stay connected with friends and teams effortlessly.
        </p>

      </div>
    </section>
  );
};

export default HeroSection;