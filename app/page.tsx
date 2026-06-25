'use client';

import LandingNav from '@/components/LandingNav';
import Link from 'next/link';

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/builder");
}
// export default function Home() {
//   return (
//     <div className="bg-background text-on-surface font-body selection:bg-secondary selection:text-on-secondary min-h-screen flex flex-col">
//       <LandingNav />
//       <main className="relative flex-1">
//         {/* Hero Section */}
//         <section className="relative min-h-[921px] flex flex-col items-start justify-center px-8 md:px-24 overflow-hidden">
//           <div className="absolute inset-0 blueprint-grid pointer-events-none"></div>
//           <div className="relative z-10 max-w-4xl space-y-8">
//             <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container border-l-2 border-secondary">
//               <span className="material-symbols-outlined text-secondary text-sm">architecture</span>
//               <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Revit Integration Live</span>
//             </div>
//             <h1 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter leading-[0.9] text-white">
//               Architectural <span className="text-secondary italic">Precision</span>,<br />AI Speed.
//             </h1>
//             <p className="text-xl md:text-2xl font-light text-on-surface-variant max-w-2xl leading-relaxed">
//               Generate photorealistic renders from your Revit models. A technical atelier designed for the professional workflow.
//             </p>
//             <div className="flex flex-wrap gap-4 pt-6">
//               <Link
//                 href="/builder"
//                 className="inline-block bg-secondary text-on-secondary px-8 py-4 rounded-lg font-label font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all text-center"
//               >
//                 Start Building
//               </Link>
//               <button className="border border-outline-variant/30 text-white px-8 py-4 rounded-lg font-label font-bold uppercase tracking-widest text-sm hover:bg-surface-bright transition-all">
//                 View Portfolio
//               </button>
//             </div>
//           </div>
//           {/* Asymmetric Decorative Element */}
//           <div className="absolute right-[-10%] top-[20%] w-1/2 h-[60%] hidden lg:block opacity-40">
//             <div className="w-full h-full bg-surface-container-high asymmetric-bleed relative overflow-hidden">
//               <img 
//                 alt="Architectural visualization" 
//                 className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" 
//                 src="https://lh3.googleusercontent.com/aida-public/AB6AXuAo4D_K5LQQe9cGHzbynEeT7b9KkOK_hHAVkl3bcIoYt4M_3tjws0n_km31of5eVN4dLzZYoXBPewFHmgaXxCRVZqbg-U6qkxI2dKENU3iFONJrGHCHb1tLLrBMcYJR-pBf7eAYpwZakF3lOD-5OExGVeOZv3arMK7S4q_3Hn7HXKbRzXvAYkfMWvb4IK1HDNNQzEwgz68lagU2Dq8VNHF-6YZaFbAI4hQ0uRQiIQFbLAIEQkp86sg9aOCabwLoCU9a8nnyZ0B8wjM"
//               />
//               <div className="absolute inset-0 bg-gradient-to-l from-background via-transparent to-transparent"></div>
//             </div>
//           </div>
//         </section>

//         {/* Features Bento Grid */}
//         <section className="py-32 px-8 md:px-24 bg-surface">
//           <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
//             <div className="space-y-4">
//               <h2 className="font-label text-xs uppercase tracking-[0.3em] text-secondary">The technical edge</h2>
//               <h3 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tight">Built for your workflow.</h3>
//             </div>
//             <div className="text-on-surface-variant max-w-md text-right font-light leading-relaxed italic">
//               "Precision isn't an option in architecture; it's the foundation."
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
//             {/* Large Feature */}
//             <div className="md:col-span-8 bg-surface-container-low p-12 relative overflow-hidden group">
//               <div className="relative z-10 space-y-6">
//                 <span className="material-symbols-outlined text-4xl text-secondary">terminal</span>
//                 <h4 className="text-3xl font-headline font-bold text-white">Architecture-First Vocabulary</h4>
//                 <p className="text-on-surface-variant max-w-md font-light">Stop fighting generic AI. Our models understand "Curtain Wall Systems," "Brise-soleil," and "Load-bearing masonry."</p>
//               </div>
//               <div className="absolute bottom-[-20px] right-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
//                 <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>architecture</span>
//               </div>
//             </div>
//             {/* Small Feature */}
//             <div className="md:col-span-4 bg-surface-container p-12 border-t-2 border-secondary flex flex-col justify-between">
//               <span className="material-symbols-outlined text-4xl text-secondary">history</span>
//               <div className="space-y-4">
//                 <h4 className="text-xl font-label font-bold uppercase tracking-widest text-white">Eliminate Reprompting</h4>
//                 <p className="text-sm text-on-surface-variant font-light leading-relaxed">One-click consistency across iterations. Maintain your architectural vision from massing to final render.</p>
//               </div>
//             </div>
//             {/* Another Feature */}
//             <div className="md:col-span-4 bg-[#1C1B1B] p-12 flex flex-col justify-between group">
//               <span className="material-symbols-outlined text-4xl text-outline-variant group-hover:text-secondary transition-colors">public</span>
//               <div className="space-y-4">
//                 <h4 className="text-xl font-label font-bold uppercase tracking-widest text-white">Global Standards</h4>
//                 <p className="text-sm text-on-surface-variant font-light leading-relaxed">Integrated BIM compliance and regional material libraries. Export-ready metadata for project specs.</p>
//               </div>
//             </div>
//             {/* Dynamic Content Area */}
//             <div className="md:col-span-8 bg-surface-container-highest/30 backdrop-blur-md p-1 p-px bg-gradient-to-br from-secondary/20 to-transparent">
//               <div className="bg-surface-container-low h-full w-full p-8 flex items-center gap-12">
//                 <div className="w-1/3 aspect-square bg-surface overflow-hidden">
//                   <img 
//                     alt="Technical skyscraper" 
//                     className="w-full h-full object-cover" 
//                     src="https://lh3.googleusercontent.com/aida-public/AB6AXuD08rPALG9UT1zgalsgNI-1MYvTbiGthPAfbrT1UqqkpLZ7ej4qBvjieWkyNQMKMQaSmgKRBRI239FuKhuSBeguaiPtek6yhzwd7_-5CuxSEy_LJ2FIl1yAvlmXmIkwD18hmtXwAVAQ3-yVlFb93sMoqw45RNK2F-lrIP13PcFOM_qnA8P2K8DzqSWnb3-Youvb6dTnlxoVW7ByFUTHypSGVd2Mj2V2pAA4Gztka9nZVzg8S1gm1758tpQBK30Lg-1Hj7XZTu6W5iw" 
//                   />
//                 </div>
//                 <div className="flex-1 space-y-4">
//                   <div className="font-['JetBrains_Mono'] text-[10px] text-secondary uppercase tracking-tighter">System Output // Revit_v2.0</div>
//                   <div className="h-px bg-outline-variant/30 w-full"></div>
//                   <p className="text-sm font-['JetBrains_Mono'] text-on-surface-variant leading-tight">
//                     &gt; INITIALIZING VOXEL RENDERING<br />
//                     &gt; MAPPING MATERIAL ID: OAK_GRAIN_01<br />
//                     &gt; APPLYING RADIOSITY CALCULATIONS...<br />
//                     &gt; COMPLETE. PRECISION: 99.8%
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Testimonial Section */}
//         <section className="py-32 px-8 md:px-24 border-t border-outline-variant/10">
//           <div className="max-w-4xl mx-auto text-center space-y-12">
//             <span className="material-symbols-outlined text-6xl text-secondary/40" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
//             <p className="text-3xl md:text-5xl font-headline font-light text-white leading-tight tracking-tight">
//               "ArchiPrompts has fundamentally changed how we communicate during the concept phase. It speaks our language—the language of structure, light, and materiality."
//             </p>
//             <div className="space-y-2">
//               <div className="font-label text-sm uppercase tracking-[0.2em] text-white">Elias Thorne</div>
//               <div className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">Principal Architect, Thorne &amp; Associates</div>
//             </div>
//           </div>
//         </section>

//         {/* Final CTA */}
//         <section className="py-32 px-8 md:px-24 bg-surface-container-low relative overflow-hidden">
//           <div className="absolute inset-0 blueprint-grid opacity-5 pointer-events-none"></div>
//           <div className="relative z-10 flex flex-col items-center text-center space-y-10">
//             <h2 className="text-5xl md:text-7xl font-headline font-extrabold text-white tracking-tighter">Ready to define the horizon?</h2>
//             <p className="text-xl text-on-surface-variant max-w-xl font-light">Join 500+ leading ateliers using ArchiPrompts to bridge the gap between model and masterpiece.</p>
//             <div className="flex gap-6">
//               <Link
//                 href="/builder"
//                 className="inline-block bg-secondary text-on-secondary px-10 py-5 rounded-lg font-label font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all text-center"
//               >
//                 Get Started
//               </Link>
//               <button className="text-white border-b border-white/20 hover:border-secondary transition-all font-label uppercase tracking-widest text-xs">Request Enterprise Demo</button>
//             </div>
//           </div>
//         </section>
//       </main>

//       {/* Footer */}
//       <footer className="w-full flex flex-col md:flex-row justify-between items-center px-8 bg-[#131313] py-8 border-t border-[#353535]/20 font-['JetBrains_Mono'] text-[9px] uppercase tracking-widest gap-4">
//         <div className="text-[#D4AF37] font-bold">ArchiPrompts Technical Atelier</div>
//         <div className="flex items-center gap-8">
//           <Link className="text-[#444444] hover:text-[#D4AF37] transition-all" href="/">Terms of Service</Link>
//           <Link className="text-[#444444] hover:text-[#D4AF37] transition-all" href="/">Privacy Policy</Link>
//           <Link className="text-[#444444] hover:text-[#D4AF37] transition-all" href="/">API Docs</Link>
//         </div>
//         <div className="text-[#444444]">© 2026 ArchiPrompts. All rights reserved.</div>
//       </footer>
//     </div>
//   );
// }
