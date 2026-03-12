import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Car, Clock, ArrowRight, Plus } from 'lucide-react';
import FadeInImage from './FadeInImage';

interface RoteirosProps {
  roteiros: any[];
  setSelectedRoteiro: (roteiro: any) => void;
  setBookingRoteiro: (roteiro: any) => void;
  setIsBookingModalOpen: (open: boolean) => void;
}

const RoteiroImage: React.FC<{ roteiro: any }> = ({ roteiro }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = roteiro.images || [roteiro.image];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="md:w-2/5 relative overflow-hidden h-64 md:h-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full"
        >
          <FadeInImage 
            src={images[currentImage]} 
            alt={roteiro.title}
            className="w-full h-full"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent md:hidden" />
      <div className="absolute top-6 left-6 z-10">
        <span className="bg-[#ff4500] text-white px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl">
          {roteiro.subtitle || "CITY TOUR ES"}
        </span>
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_: any, i: number) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentImage ? 'bg-white w-4' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Roteiros: React.FC<RoteirosProps> = ({ roteiros, setSelectedRoteiro, setBookingRoteiro, setIsBookingModalOpen }) => {
  return (
    <section id="roteiros" className="py-24 px-6 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          <span className="text-orange-600 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">
            Planeje sua Aventura
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-black text-stone-900 tracking-tight">
            Roteiros Exclusivos
          </h2>
          <p className="text-stone-500 mt-4 max-w-2xl mx-auto">
            Escolha um de nossos roteiros cuidadosamente planejados para você aproveitar o melhor do Espírito Santo com conforto e segurança.
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key="roteiros-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            {roteiros.map((roteiro, index) => (
              <motion.div 
                key={roteiro.id || `roteiro-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedRoteiro(roteiro)}
                className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5 border border-stone-100 flex flex-col md:flex-row group cursor-pointer hover:border-orange-200 transition-all duration-500 hover:-translate-y-2"
              >
                <RoteiroImage roteiro={roteiro} />
                <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-between relative bg-white">
                  <div className="absolute top-6 right-6 md:top-8 md:right-10 z-20">
                    <span className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] bg-orange-50 px-4 py-2 rounded-full border border-orange-100 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5" /> Premium
                    </span>
                  </div>
                  
                  <div className="mt-10 md:mt-4">
                    <div className="mb-8">
                      <h3 className="text-3xl md:text-4xl font-display font-black text-stone-900 leading-[0.9] tracking-tighter uppercase mb-4">{roteiro.title}</h3>
                      <div className="flex flex-wrap gap-4">
                        {roteiro.vehicle && (
                          <div className="flex items-center gap-2 text-stone-400">
                            <Car className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{roteiro.vehicle}</span>
                          </div>
                        )}
                        {roteiro.timeDeparture && (
                          <div className="flex items-center gap-2 text-stone-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{roteiro.timeDeparture}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-10">
                      <h4 className="text-[10px] font-black text-stone-300 uppercase tracking-[0.3em] mb-5">Destinos Inclusos</h4>
                      <div className="flex flex-wrap gap-2">
                        {roteiro.places.slice(0, 3).map((place: string, idx: number) => (
                          <span key={`${place}-${idx}`} className="bg-stone-50 text-stone-600 px-4 py-2 rounded-xl text-[10px] font-bold border border-stone-100">
                            {place}
                          </span>
                        ))}
                        {roteiro.places.length > 3 && (
                          <span className="text-[10px] text-stone-400 font-bold py-2 ml-1">+{roteiro.places.length - 3}</span>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedRoteiro(roteiro)}
                      className="text-orange-600 font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:gap-5 transition-all mb-10 group/link"
                    >
                      Explorar Detalhes 
                      <ArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-stone-100">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest mb-1">Investimento</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-black text-stone-900">R$</span>
                        <span className="text-3xl font-black text-stone-900 tracking-tighter">{roteiro.price}</span>
                        <span className="text-[10px] font-bold text-stone-400 ml-1">/GRUPO</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setBookingRoteiro(roteiro);
                        setIsBookingModalOpen(true);
                      }}
                      className="bg-stone-900 text-white p-4 rounded-2xl hover:bg-orange-600 transition-colors shadow-xl shadow-black/10"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default React.memo(Roteiros);
