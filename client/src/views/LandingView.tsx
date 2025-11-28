import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Figma } from "lucide-react";
import { getAuthorizationUrl } from "../api/figma-oauth";

const LandingView: React.FC = () => {
  //   const [isLoading, setIsLoading] = useState(false);

  // Simple fade-up animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as const },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const authUrl = getAuthorizationUrl();

  return (
    <div className="relative min-h-screen w-full bg-[#FAFAF9] text-stone-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-hidden flex flex-col items-center justify-center">
      {/* --- Creamy/Warm Background Gradients --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] bg-orange-100/50 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] bg-rose-100/40 rounded-full blur-[120px]" />
      </div>

      {/* --- Main Content --- */}
      <div className="relative z-10 w-full max-w-4xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center space-y-12"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="flex justify-center">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-stone-500 text-xs font-medium text-stone-500 uppercase tracking-widest shadow-sm">
              Design to Code
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-6xl md:text-8xl font-serif font-medium tracking-tight text-stone-900 leading-[1.1]"
          >
            Design in <span className="text-orange-600">Figma</span>. <br />
            Build in <span className="italic text-stone-600">Seconds</span>.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="text-xl text-stone-500 max-w-xl mx-auto leading-relaxed"
          >
            The bridge between your creativity and production code. Convert
            layouts instantly without losing the details.
          </motion.p>

          {/* CTA Button - Use anchor tag instead */}
          <motion.div variants={fadeInUp} className="pt-2">
            <a
              href={authUrl}
              className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-medium text-white bg-stone-900 rounded-full hover:bg-stone-800 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-orange-900/10 hover:-translate-y-1"
            >
              <span className="flex items-center space-x-3">
                <Figma className="w-5 h-5" />
                <span>Connect Figma Account</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </a>
            <p className="mt-6 text-xs text-stone-400 font-medium tracking-wide uppercase">
              Free Alpha Access • No Setup Required
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingView;
