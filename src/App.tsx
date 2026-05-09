import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Mic, MicOff, Power, RefreshCw, Volume2, Globe, Command } from 'lucide-react';
import { LiveSession, SessionState } from './lib/live-session';

/**
 * Lara Neural Presence - Reimagined with deep glassmorphism and organic motion.
 */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 100, damping: 20 }
  },
};

export default function App() {
  const [state, setState] = useState<SessionState>(SessionState.DISCONNECTED);
  const sessionRef = useRef<LiveSession | null>(null);

  useEffect(() => {
    sessionRef.current = new LiveSession((newState) => {
      setState(newState);
    });

    const interval = setInterval(() => {
      sessionRef.current?.update();
    }, 100);

    return () => {
      clearInterval(interval);
      sessionRef.current?.disconnect();
    };
  }, []);

  const toggleConnection = () => {
    if (state === SessionState.DISCONNECTED) {
      sessionRef.current?.connect();
    } else {
      sessionRef.current?.disconnect();
    }
  };

  const getStatusText = () => {
    switch (state) {
      case SessionState.DISCONNECTED: return "System Offline";
      case SessionState.CONNECTING: return "Establishing Link...";
      case SessionState.CONNECTED: return "Sync Complete";
      case SessionState.LISTENING: return "Listening to Input";
      case SessionState.SPEAKING: return "Synthesizing Voice";
      case SessionState.ERROR: return "Connection Terminated";
      default: return "";
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      id="lara-app" 
      className="fixed inset-0 bg-[#020202] text-white flex flex-col items-center justify-center font-sans overflow-hidden select-none"
    >
      {/* Immersive Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
           animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-20"
        >
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-magenta-900/20 blur-[160px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 bg-blue-900/10 blur-[160px] rounded-full" />
        </motion.div>
        
        {/* Fine Grain Overlay */}
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />
      </div>

      {/* Top Header - Glass Navbar */}
      <motion.header 
        variants={itemVariants}
        className="absolute top-0 left-0 right-0 p-6 md:p-10 flex justify-between items-center z-40"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-magenta-500 shadow-[0_0_15px_rgba(219,39,119,1)]" />
              <motion.div 
                animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-magenta-500/50"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase italic leading-none">
              Lara<span className="text-magenta-500">.</span>
            </h1>
          </div>
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-white/30 font-bold ml-6">
            Neural Interface <span className="opacity-50">3.1.0</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end gap-0.5">
            <span className="text-[10px] uppercase tracking-widest text-magenta-500 font-black">Saheb's Creation</span>
            <span className="text-[9px] uppercase tracking-widest text-white/20">Somagam Ghosh</span>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <AnimatePresence>
            {state !== SessionState.DISCONNECTED && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-3xl flex items-center gap-3 shadow-xl"
              >
                <div className="flex gap-1.5 h-3 items-center">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        scaleY: state === SessionState.SPEAKING ? [1, 2.5, 1] : 1,
                        opacity: state === SessionState.SPEAKING ? 1 : 0.3
                      }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                      className="w-0.5 bg-magenta-400 rounded-full h-full origin-center"
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono tracking-widest text-white/70 uppercase">{state}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Main Vision Stage */}
      <main className="relative flex flex-col items-center justify-center w-full max-w-4xl px-6 h-full">
        
        {/* Status Label - Minimal Floating */}
        <motion.div 
          variants={itemVariants}
          className="absolute top-[18%] md:top-[22%] z-10"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              className="flex flex-col items-center gap-2"
            >
              <p className="text-[11px] md:text-sm font-semibold text-white/50 tracking-[0.4em] uppercase text-center">
                {getStatusText()}
              </p>
              <div className="h-px w-8 bg-magenta-500/40 rounded-full" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* The Core - Organic Flow */}
        <motion.div 
           variants={itemVariants}
           className="relative group cursor-pointer" 
           onClick={toggleConnection}
        >
          {/* External Halo */}
          <div className="absolute inset-[-60px] md:inset-[-100px] pointer-events-none">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: state !== SessionState.DISCONNECTED ? [1, 1.1, 1] : 1
              }}
              transition={{ 
                rotate: { duration: 30, repeat: Infinity, ease: "linear" },
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute inset-0 rounded-full border border-white/[0.03] shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]"
            />
          </div>

          {/* Deep Ambient Glow */}
          <AnimatePresence>
            {state !== SessionState.DISCONNECTED && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-[-120px] md:inset-[-180px] pointer-events-none z-0"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-magenta-500/20 via-purple-600/10 to-blue-500/20 rounded-full blur-[100px] md:blur-[160px] animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Neural Cell */}
          <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center z-10">
            <div className="relative w-full h-full flex items-center justify-center">
              <AnimatePresence>
                {state !== SessionState.DISCONNECTED ? (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="relative w-[90%] h-[90%]"
                  >
                    {/* Layered Glass Orbs */}
                    <motion.div 
                       animate={{ 
                        borderRadius: ["38% 62% 63% 37% / 41% 44% 56% 59%", "62% 38% 30% 70% / 50% 60% 40% 50%", "38% 62% 63% 37% / 41% 44% 56% 59%"],
                        rotate: 360
                       }}
                       transition={{ 
                        borderRadius: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                       }}
                       className="absolute inset-0 bg-gradient-to-br from-magenta-400 via-purple-600 to-blue-700 opacity-90 shadow-[0_0_100px_rgba(219,39,119,0.4)]"
                    />
                    
                    <motion.div 
                       animate={{ 
                        borderRadius: ["62% 38% 30% 70% / 50% 60% 40% 50%", "38% 62% 63% 37% / 41% 44% 56% 59%", "62% 38% 30% 70% / 50% 60% 40% 50%"],
                        rotate: -360
                       }}
                       transition={{ 
                        borderRadius: { duration: 12, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 25, repeat: Infinity, ease: "linear" }
                       }}
                       className="absolute inset-4 bg-black/20 backdrop-blur-md border border-white/10"
                    />

                    {/* Central Activity Sphere */}
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="flex items-center justify-center gap-1.5 md:gap-2.5 h-16 md:h-24">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{ 
                              height: state === SessionState.SPEAKING 
                                ? [15, Math.random() * 100 + 40, 15] 
                                : state === SessionState.LISTENING 
                                  ? [12, Math.random() * 40 + 20, 12]
                                  : 10 
                            }}
                            transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.04 }}
                            className="w-1.5 md:w-2 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Sleeping State Core */
                  <motion.div
                    whileHover={{ scale: 1.05, borderColor: "rgba(219,39,119,0.5)" }}
                    className="w-56 h-56 md:w-72 md:h-72 rounded-full border border-white/5 flex flex-col items-center justify-center bg-white/[0.01] backdrop-blur-2xl transition-all duration-700 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-magenta-500/5 to-transparent pointer-events-none" />
                    <Power className="w-12 h-12 md:w-16 md:h-16 text-white/10 group-hover:text-magenta-400/50 transition-colors duration-500 mb-4" />
                    <span className="text-[10px] uppercase tracking-[0.6em] text-white/20 font-bold group-hover:text-magenta-400/40 transition-colors">Initialize</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Footer - Control & Credits */}
        <motion.footer 
          variants={itemVariants}
          className="absolute bottom-12 md:bottom-20 w-full flex flex-col items-center gap-10 z-40"
        >
          <AnimatePresence>
            {state !== SessionState.DISCONNECTED && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="flex flex-col items-center gap-6"
              >
                {/* Feature Pills */}
                <div className="flex items-center gap-3 md:gap-5 px-6 py-4 md:px-10 md:py-5 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-[40px] shadow-2xl">
                  <div className="flex items-center gap-3 px-4 py-2 bg-magenta-500/10 rounded-full border border-magenta-500/20">
                     <Globe className="w-4 h-4 text-magenta-400" />
                     <span className="text-[10px] md:text-xs font-bold text-magenta-100 uppercase tracking-widest leading-none mt-0.5">Live Browser</span>
                  </div>
                  <div className="w-px h-5 bg-white/10" />
                  <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                     <Command className="w-4 h-4 text-blue-400" />
                     <span className="text-[10px] md:text-xs font-bold text-blue-100 uppercase tracking-widest leading-none mt-0.5">Voice Engine</span>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); sessionRef.current?.disconnect(); }}
                  className="flex items-center gap-3 px-8 py-3 rounded-full hover:bg-white/5 transition-all group"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-white/20 group-hover:rotate-180 transition-transform duration-700" />
                  <span className="text-[11px] text-white/30 uppercase tracking-[0.5em] group-hover:text-white/60">Terminate Session</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {state === SessionState.DISCONNECTED && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-[10px] md:text-xs text-white/20 uppercase tracking-[0.8em] font-medium">Link with Neural Core</p>
              <div className="flex gap-1.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/5" />
                ))}
              </div>
            </div>
          )}
        </motion.footer>
      </main>

      {/* Side Decorative Elements */}
      <div className="absolute inset-y-0 left-8 hidden xl:flex flex-col justify-center items-center gap-12 opacity-10 pointer-events-none">
        <div className="w-[1px] h-32 bg-gradient-to-b from-transparent via-white to-transparent" />
        <span className="[writing-mode:vertical-lr] text-[9px] uppercase tracking-[1em] font-black">Neural Interface Prototype</span>
        <div className="w-[1px] h-32 bg-gradient-to-t from-transparent via-white to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-8 hidden xl:flex flex-col justify-center items-center gap-12 opacity-10 pointer-events-none">
        <div className="w-[1px] h-32 bg-gradient-to-b from-transparent via-white to-transparent" />
        <span className="[writing-mode:vertical-lr] text-[9px] uppercase tracking-[1em] font-black italic">By Somagam Ghosh</span>
        <div className="w-[1px] h-32 bg-gradient-to-t from-transparent via-white to-transparent" />
      </div>
    </motion.div>
  );
}

