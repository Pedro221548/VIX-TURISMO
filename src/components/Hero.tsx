import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface HeroProps {
  contactInfo: any;
}

const Hero: React.FC<HeroProps> = ({ contactInfo }) => {
  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={contactInfo.heroImage || "https://upload.wikimedia.org/wikipedia/commons/0/03/Convento_da_Penha_e_Terceira_Ponte_com_Mar_e_Vit%C3%B3ria_ao_fundo.jpg"} 
          alt="Vitória ES" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#fafaf9]" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.4em] mb-10 backdrop-blur-xl shadow-2xl">
            <Sparkles className="w-4 h-4 text-orange-400" /> {contactInfo.heroTitle || "A melhor experiência no ES"}
          </span>
          <h1 className="text-7xl md:text-[10rem] font-display font-black text-white tracking-tighter leading-[0.8] mb-10 uppercase drop-shadow-2xl">
            {contactInfo.heroTitle ? contactInfo.heroTitle.split(' ').slice(0, -2).join(' ') : "VIVA O"} <br />
            <span className="text-orange-500">{contactInfo.heroTitle ? contactInfo.heroTitle.split(' ').slice(-2).join(' ') : "ESPÍRITO SANTO"}</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/80 max-w-2xl mx-auto mb-14 font-medium leading-relaxed drop-shadow-md">
            {contactInfo.heroSubtitle || "Roteiros exclusivos, conforto premium e guias credenciados para você descobrir o paraíso capixaba."}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a 
              href="#roteiros"
              className="bg-orange-600 text-white px-12 py-6 rounded-3xl font-black text-lg hover:bg-orange-500 transition-all shadow-2xl shadow-orange-600/40 flex items-center gap-3 group"
            >
              Explorar Roteiros
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </a>
            <a 
              href={`https://wa.me/${contactInfo.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-12 py-6 rounded-3xl font-black text-lg hover:bg-white/20 transition-all flex items-center gap-3"
            >
              Falar com Consultor
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-orange-600 to-transparent" />
      </motion.div>
    </section>
  );
};

export default React.memo(Hero);
