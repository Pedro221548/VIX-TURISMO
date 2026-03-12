import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface FleetProps {
  frota: any[];
}

const Fleet: React.FC<FleetProps> = ({ frota }) => {
  return (
    <section id="frota" className="py-32 px-6 bg-stone-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-[120px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-900/20 rounded-full blur-[120px] -ml-48 -mb-48" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <span className="text-orange-500 font-black text-[10px] uppercase tracking-[0.5em] mb-6 block">
              Nossa Frota
            </span>
            <h2 className="text-5xl md:text-7xl font-display font-black text-white tracking-tighter leading-[0.9] uppercase">
              Conforto <br />
              <span className="text-orange-500">Sem Limites</span>
            </h2>
          </div>
          <p className="text-stone-400 text-lg max-w-sm leading-relaxed">
            Veículos modernos, inspecionados e equipados para garantir o máximo de conforto em cada quilômetro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {frota.map((item, index) => (
            <motion.div 
              key={item.id || index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white/5 backdrop-blur-xl rounded-[3rem] overflow-hidden border border-white/10 group shadow-2xl transition-all duration-700 hover:border-orange-500/50"
            >
              <div className="h-80 overflow-hidden relative">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
              </div>
              <div className="p-10 md:p-14">
                <h3 className="text-3xl font-display font-black text-white mb-4 uppercase tracking-tighter">{item.title}</h3>
                <p className="text-stone-400 mb-10 text-lg leading-relaxed">{item.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {item.features?.map((feature: string, i: number) => (
                    <div key={i} className="flex items-center gap-4 text-stone-300 text-sm font-bold uppercase tracking-widest">
                      <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/20">
                        <Check className="w-4 h-4" />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Fleet);
