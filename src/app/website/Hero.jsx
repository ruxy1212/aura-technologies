import { ArrowRight } from 'lucide-react';
import './hero.css'
import { HeartPulse } from 'lucide-react';
import { Video } from 'lucide-react';
import { Rocket } from 'lucide-react';
import { Key } from 'lucide-react';
import { CheckCircle } from 'lucide-react';

export default function Hero() {
  return (
    <section>
      <section className="mobile-hero relative min-h-[90vh] flex flex-col items-center justify-start md:hidden px-margin-mobile pt-8 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-[-1] opacity-40 mix-blend-luminosity">
          <img alt="Hero Background" className="w-full h-[60vh] object-cover object-top mask-image-b [mask-image:linear-gradient(to bottom, black 30%, transparent 100%)] [-webkit-mask-image:linear-gradient(to bottom, black 30%, transparent 100%)]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBvv7orFSaQn9SJXgAVqzR7LClJEvB9fozMdMntUkR1OKVzRMqVlp5giwrZ_hWd9X2nVIzJT9rO1uZ5e53Ij4cIVoCJwIAvPHStefRYPNNh7N7FkznQQNpNxFCv7DraKHwhS06ppBmnq6T9Nrhd0XYt4hYmm22x5gig4wGjFlBAgrQZ3517ir1tCU7aBg9nwSifzCl9F_-SSQiArQroMF9Id5Ds4t1Cp_tORConZj0ZYjPggsLPf74K5RR-7RWfrX1xgQT_Cc1wpo" />
        </div>
        <div className="w-full flex flex-col gap-6 relative z-10 mt-8">
          <div className="flex flex-col gap-4 text-center">
            <div className="infinite-progress absolute top-[-32px] left-0"></div>
            <div className="inline-flex items-center justify-center gap-2 mb-2">
              <span className="font-label-caps text-label-caps text-primary-fixed uppercase text-[10px] tracking-[0.3em]">AURA TECHNOLOGIES</span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight leading-[1.1]">
              Multimodal Intellisense infrastructure.
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mx-auto">
              Empower your applications with real-time biometric signals.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full mt-4">
            <button className="w-full bg-primary text-[#000000] font-data-mono text-data-mono py-4 rounded font-bold hover:bg-primary-fixed transition-colors active:scale-[0.98] flex items-center justify-center gap-2 ambient-glow">
              Launch Live Demo
              <Rocket size={18} className="text-current" />
            </button>
            <button className="w-full bg-transparent border border-outline-variant text-on-surface font-data-mono text-data-mono py-4 rounded hover:bg-surface-container-high hover:border-primary transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              Request API Key
              <Key size={18} className="text-current" />
            </button>
          </div>
          <div className="flex flex-col gap-unit w-full mt-8">
            <div className="glass-panel p-4 rounded-lg flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-12 h-12 bg-primary/10 blur-[15px] rounded-full group-hover:bg-primary/20 transition-all"></div>
              <div className="flex justify-between items-center w-full border-b border-outline-variant/20 pb-2">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Latency</span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-data-mono text-[28px] leading-none text-primary-fixed font-bold tracking-tight">12</span>
                <span className="font-data-mono text-data-mono text-on-surface-variant">ms</span>
              </div>
            </div>
            <div className="glass-panel p-4 rounded-lg flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-12 h-12 bg-secondary-container/10 blur-[15px] rounded-full group-hover:bg-secondary-container/20 transition-all"></div>
              <div className="flex justify-between items-center w-full border-b border-outline-variant/20 pb-2">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Accuracy</span>
                <CheckCircle size={14} className="text-secondary-fixed" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-data-mono text-[28px] leading-none text-on-surface font-bold tracking-tight">99.9</span>
                <span className="font-data-mono text-data-mono text-secondary-fixed">%</span>
              </div>
            </div>
            <div className="glass-panel p-4 rounded-lg flex flex-col gap-2 relative overflow-hidden inner-glow">
              <div className="flex justify-between items-center w-full border-b border-outline-variant/20 pb-2">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Live Stream</span>
                <div className="flex gap-1">
                  <span className="w-1 h-3 bg-primary animate-[pulse_1s_ease-in-out_infinite]"></span>
                  <span className="w-1 h-2 bg-primary/50 animate-[pulse_1.2s_ease-in-out_infinite]"></span>
                  <span className="w-1 h-4 bg-primary animate-[pulse_0.8s_ease-in-out_infinite]"></span>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-primary rounded-full relative">
                    <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_ease-in-out_infinite]"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs font-data-mono text-on-surface-variant">
                  <span>Processing nodes</span>
                  <span className="text-primary-fixed">Active (85%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="desktop-hero hidden relative min-h-[90vh] items-center pt-8 md:pt-16 pb-16 md:pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto md:flex">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-gutter w-full relative z-10 items-center text-center lg:text-left">
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start gap-6 md:gap-8 z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-live-dot"></span>
              <span className="font-data-mono text-data-mono text-primary">v2.0 Beta Live</span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-display-lg md:text-display-lg text-on-surface max-w-[15ch] mx-auto lg:mx-0">
              Multimodal Intellisense <span className="text-gradient">infrastructure.</span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-[500px] mx-auto lg:mx-0">
              Empower your applications with real-time biometric signals derived from video and voice. Ship responsive wellness and engagement experiences without specialized hardware.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2 md:mt-4">
              <button className="font-label-caps text-label-caps bg-primary text-on-primary px-8 py-4 rounded-DEFAULT hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(0,229,255,0.2)] w-full sm:w-auto">
                Launch Live Demo
                <ArrowRight size={18} className="" />
              </button>
              <button className="font-data-mono text-data-mono border border-outline-variant/50 text-on-surface px-8 py-4 rounded-DEFAULT hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2 bg-surface/50 backdrop-blur-sm relative group overflow-hidden active:scale-95 w-full sm:w-auto">
                <span className="relative z-10">Request API Key</span>
                <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
          <div className="lg:col-span-6 relative mt-8 lg:mt-0 z-10 w-full aspect-4/5 sm:aspect-[4/3] lg:aspect-square flex items-center justify-center">
            <div className="absolute inset-0 rounded-xl overflow-hidden border border-outline-variant/20 shadow-[0_0_40px_rgba(0,218,243,0.05)]">
              <img alt="Cinematic rendering of a glowing, neural-network-like structure suspended in a dark, high-tech server room setting. The central object features interlocking, dark geometric shapes emitting bright cyan and soft green light along intricate, root-like tendrils. In the background, out-of-focus server racks with glowing blue indicators suggest a vast data center. Ethereal, flowing waveforms in neon blue and pale green overlay the scene, labeled with 'Heart rate', 'Breathing', and 'Voice' in a clean, modern sans-serif font, floating above a reflective glass surface." className="w-full h-full object-cover opacity-80 mix-blend-lighten" src="https://lh3.googleusercontent.com/aida/ADBb0ugMzkgTDxSSkNwo4sOV8ojYJTO1eblwuB4wsBl_ca0mAGUqDdYzM-vU_UyNuhTe7fuZFAPTVa9-RULZ7Qo3zPx2ZtyAkfLUuM3v3ZK7xDD7zRHo8zcrDQfb_6hCviFQT5N80cR_VPuJaDYGmDi3IS8ynl0nPCDYWBN1vAEizeJqhYtjaiDvYf0NFI_SXheF79PtdH2kzIam6EuO_xEd_9UPbJEO3Qol04fRkyc1s6HJZRwe4TyiH6rDMCQ" />
              <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/20 to-transparent"></div>
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/10 to-transparent h-32 w-full animate-scan pointer-events-none"></div>
            </div>
            <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between pointer-events-none">
              <div className="self-end glass-panel rounded-lg p-3 sm:p-4 w-32 sm:w-40 glow-shadow relative overflow-hidden pointer-events-auto group hover:border-primary/50 transition-colors">
                <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <span className="font-label-caps text-[10px] sm:text-label-caps text-on-surface-variant uppercase">Latency</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed shadow-[0_0_8px_rgba(77,255,178,0.8)]"></span>
                </div>
                <div className="font-data-mono text-sm sm:text-data-mono text-on-surface text-lg sm:text-xl">
                  <span className="text-primary">&lt;</span> 33<span className="text-on-surface-variant text-xs sm:text-sm ml-1">ms</span>
                </div>
              </div>
              <div className="self-start glass-panel rounded-lg p-3 sm:p-5 w-48 sm:w-64 glow-shadow pointer-events-auto transform -translate-y-2 sm:-translate-y-4 hover:scale-[1.02] transition-transform">
                <div className="flex justify-between items-center mb-2 sm:mb-4 border-b border-white/10 pb-1 sm:pb-2">
                  <span className="font-label-caps text-[10px] sm:text-label-caps text-on-surface-variant uppercase flex items-center gap-1 sm:gap-2">
                    <HeartPulse size={12} className="sm:size-[14px]" />
                    Signal Stream
                  </span>
                  <span className="text-[8px] sm:text-[10px] text-secondary-fixed animate-pulse">REC</span>
                </div>
                <div className="space-y-2 sm:space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] sm:text-xs font-data-mono text-on-surface-variant mb-1">
                      <span>HRV</span>
                      <span className="text-primary">68 bpm</span>
                    </div>
                    <div className="h-6 sm:h-8 w-full relative overflow-hidden flex items-end">
                      <svg className="w-full h-full stroke-primary fill-none stroke-[1.5]" preserveaspectratio="none" viewbox="0 0 100 30">
                        <path className="opacity-80" d="M0,15 L10,15 L15,5 L20,25 L25,15 L40,15 L45,10 L50,20 L55,15 L70,15 L75,5 L80,25 L85,15 L100,15" stroke-linecap="round" stroke-linejoin="round"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] sm:text-xs font-data-mono text-on-surface-variant mb-1">
                      <span>BR</span>
                      <span className="text-secondary-fixed-dim">14 rpm</span>
                    </div>
                    <div className="h-4 sm:h-6 w-full relative overflow-hidden flex items-end">
                      <svg className="w-full h-full stroke-secondary-fixed-dim fill-none stroke-[1.5]" preserveaspectratio="none" viewbox="0 0 100 20">
                        <path className="opacity-60" d="M0,10 C20,10 25,2 40,10 C55,18 60,10 80,10 C90,10 95,5 100,10" stroke-linecap="round"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-end glass-panel rounded-lg p-2 sm:p-4 w-40 sm:w-48 glow-shadow pointer-events-auto flex items-center gap-2 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-outline-variant/30 flex items-center justify-center bg-surface-container/50 shrink-0">
                  <Video size={16} className="text-primary sm:size-[20px]" />
                </div>
                <div>
                  <div className="font-label-caps text-[10px] sm:text-label-caps text-on-surface-variant uppercase mb-0.5 sm:mb-1">Stream</div>
                  <div className="font-data-mono text-[10px] sm:text-data-mono text-on-surface">30 <span className="text-on-surface-variant">FPS</span> <span className="text-outline-variant mx-1">|</span> 1080p</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};
