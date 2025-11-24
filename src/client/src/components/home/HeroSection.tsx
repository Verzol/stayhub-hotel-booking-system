export default function HeroSection() {
  return (
    <div className="relative h-[450px] bg-slate-900">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center pb-24">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
          StayHub <br /> Your Ideal Stay Awaits.
        </h1>
        <p className="text-white/90 text-lg font-medium max-w-xl drop-shadow-md">
          Book hotels, resorts, and homestays with the best deals.
        </p>
      </div>
    </div>
  );
}
