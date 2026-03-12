import React from 'react';
import { motion } from 'motion/react';
import { Instagram as InstagramIcon, ArrowRight } from 'lucide-react';

const Instagram: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 text-center lg:text-left">
            <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.5em] mb-6 block">
              Siga-nos no Instagram
            </span>
            <h2 className="text-5xl md:text-7xl font-display font-black text-stone-900 tracking-tighter leading-[0.9] uppercase mb-8">
              Acompanhe <br />
              <span className="text-orange-600">Nossa Jornada</span>
            </h2>
            <p className="text-stone-500 text-lg mb-10 max-w-md mx-auto lg:mx-0">
              Fique por dentro das novidades, veja fotos exclusivas e acompanhe nossos roteiros em tempo real através do nosso Instagram oficial.
            </p>
            <a 
              href="https://www.instagram.com/city_tour_es/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 bg-stone-900 text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-2xl shadow-black/10 group"
            >
              <InstagramIcon className="w-5 h-5" />
              Seguir no Instagram
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </a>
          </div>

          <div className="lg:w-1/2 relative flex justify-center">
            {/* Phone Mockup */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative w-[300px] h-[600px] bg-stone-900 rounded-[3rem] border-[8px] border-stone-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Screen Content */}
              <div className="absolute inset-0 bg-white overflow-hidden">
                <img 
                  src="https://i.imgur.com/QlfePaI.png" 
                  alt="Instagram Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-800 rounded-b-2xl z-10"></div>
            </motion.div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-orange-600/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(Instagram);
