import { ShieldCheck, Star, Headphones } from 'lucide-react';
import HeroSection from '../../components/home/HeroSection';
import SearchWidget from '../../components/home/SearchWidget';

export default function LandingPage() {
  return (
    <>
      <HeroSection />

      <SearchWidget />

      {/* Features / Trust Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                Secure Booking
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                We guarantee your booking is secure and your data is protected.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Best Price</h3>
              <p className="text-slate-500 text-sm mt-1">
                Find the best deals and prices for your perfect stay.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">24/7 Support</h3>
              <p className="text-slate-500 text-sm mt-1">
                Our support team is available around the clock to assist you.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Trending Destinations
          </h2>
          <a
            href="#"
            className="text-blue-600 font-bold text-sm hover:underline"
          >
            See all
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: 'Da Nang',
              img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800',
            },
            {
              name: 'Ho Chi Minh City',
              img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800',
            },
            {
              name: 'Hanoi',
              img: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800',
            },
            {
              name: 'Phu Quoc',
              img: 'https://images.unsplash.com/photo-1540202404-a6f746353673?q=80&w=800',
            },
          ].map((city, i) => (
            <div
              key={i}
              className="group cursor-pointer rounded-xl overflow-hidden relative aspect-[3/4] shadow-md hover:shadow-xl transition-all"
            >
              <img
                src={city.img}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">{city.name}</h3>
                <p className="text-sm font-medium opacity-90">
                  1,200+ Accommodations
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Simple */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 font-medium">
            © 2025 StayHub. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
