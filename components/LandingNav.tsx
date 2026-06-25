'use client';

import Link from 'next/link';

export default function LandingNav() {
  return (
    <nav className="flex justify-between items-center w-full px-8 h-16 sticky top-0 z-50 backdrop-blur-md bg-opacity-90 bg-[#1C1B1B] border-b border-[#353535]/10 font-headline font-light tracking-tight text-sm">
      <div className="text-xl font-bold tracking-tighter text-white uppercase">ArchiPrompts</div>
      <div className="hidden md:flex items-center gap-8">
        <Link 
          className="text-[#D4AF37] border-b border-[#D4AF37] pb-1 transition-colors duration-300" 
          href="/"
        >
          Gallery
        </Link>
        <Link 
          className="text-[#A0A0A0] hover:text-white transition-colors duration-300" 
          href="/"
        >
          Blueprints
        </Link>
        <Link 
          className="text-[#A0A0A0] hover:text-white transition-colors duration-300" 
          href="/"
        >
          Specs
        </Link>
      </div>
      <div className="flex items-center gap-6">
        <Link 
          className="text-[#A0A0A0] hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-label" 
          href="/builder"
        >
          Sign In
        </Link>
        <Link 
          href="/builder"
          className="bg-secondary text-on-secondary px-5 py-2 rounded-lg font-label font-bold text-[11px] uppercase tracking-widest active:scale-95 transition-all"
        >
          Build Now
        </Link>
      </div>
    </nav>
  );
}
