import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, MessageCircle, ArrowRight } from 'lucide-react';

interface ContactProps {
  contactInfo: any;
}

const Contact: React.FC<ContactProps> = ({ contactInfo }) => {
  return (
    <section className="py-40 px-6 bg-stone-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <img 
          src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80" 
          alt="Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent" />
      </div>
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.4em] mb-10 shadow-2xl shadow-orange-600/40">
            <Sparkles className="w-4 h-4" /> Comece sua jornada hoje
          </span>
          <h2 className="text-6xl md:text-[8rem] font-display font-black text-white tracking-tighter leading-[0.85] mb-12 uppercase">
            Pronto para <br />
            <span className="text-orange-500">Descobrir o ES?</span>
          </h2>
          <p className="text-xl text-stone-400 max-w-2xl mx-auto mb-16 leading-relaxed">
            Nossa equipe está pronta para criar o roteiro perfeito para você. Entre em contato agora e garanta sua reserva.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a 
              href={`https://wa.me/${contactInfo.whatsapp}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full md:w-auto bg-green-600 text-white px-12 py-6 rounded-3xl font-black text-lg hover:bg-green-700 transition-all shadow-2xl shadow-green-600/20 flex items-center justify-center gap-3 group"
            >
              <MessageCircle className="w-6 h-6" />
              Falar no WhatsApp
            </a>
            <a 
              href="#roteiros"
              className="w-full md:w-auto bg-white/10 backdrop-blur-xl border border-white/20 text-white px-12 py-6 rounded-3xl font-black text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-3"
            >
              Ver Roteiros
              <ArrowRight className="w-6 h-6" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default React.memo(Contact);
