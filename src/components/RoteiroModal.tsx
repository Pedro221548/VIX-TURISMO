import React from 'react';
import { motion } from 'motion/react';
import { X, MapPin, Clock, BookOpen, Utensils, Sparkles, Camera, Car, ShieldCheck, Image as ImageIcon, Download, MessageCircle } from 'lucide-react';
import FadeInImage from './FadeInImage';

interface RoteiroModalProps {
  roteiro: any;
  onClose: () => void;
  contactInfo: any;
  onDownload: (url: string, filename: string) => void;
}

const RoteiroModal: React.FC<RoteiroModalProps> = ({ roteiro, onClose, contactInfo, onDownload }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-64 md:h-80">
          <FadeInImage 
            src={roteiro.images ? roteiro.images[0] : roteiro.image} 
            alt={roteiro.title}
            className="w-full h-full"
            loading="eager"
          />
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white p-2 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          <div className="absolute bottom-6 left-8">
            <span className="bg-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-2 inline-block">
              {roteiro.subtitle}
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-stone-900">{roteiro.title}</h2>
            {roteiro.vehicle && (
              <div className="flex items-center gap-2 mt-2 text-stone-500">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Veículo: {roteiro.vehicle}</span>
              </div>
            )}
            {roteiro.timeDeparture && roteiro.timeReturn ? (
              <div className="flex items-center gap-2 mt-2 text-stone-500">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Ida: {roteiro.timeDeparture} | Volta: {roteiro.timeReturn}</span>
              </div>
            ) : roteiro.time && (
              <div className="flex items-center gap-2 mt-2 text-stone-500">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-xs md:text-sm font-bold uppercase tracking-wider">{roteiro.time}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-orange-600">
                <BookOpen className="w-5 h-5" />
                <h4 className="font-bold uppercase text-xs tracking-widest">História</h4>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">{roteiro.history}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-orange-600">
                <Utensils className="w-5 h-5" />
                <h4 className="font-bold uppercase text-xs tracking-widest">Gastronomia</h4>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">{roteiro.gastronomy}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-orange-600">
                <Sparkles className="w-5 h-5" />
                <h4 className="font-bold uppercase text-xs tracking-widest">Curiosidades</h4>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">{roteiro.curiosities}</p>
            </div>
          </div>

          <div className="mb-12">
            <h4 className="font-bold text-stone-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" /> Pontos Visitados
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {roteiro.places.map((place: string, idx: number) => (
                <div key={`${place}-${idx}`} className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <Camera className="w-3 h-3 text-stone-400" />
                  <span className="text-xs text-stone-600 font-medium">{place}</span>
                </div>
              ))}
            </div>
          </div>

          {roteiro.courtesy && roteiro.courtesy.length > 0 && (
            <div className="mb-12">
              <h4 className="font-bold text-stone-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-600" /> Cortesias Incluídas
              </h4>
              <div className="flex flex-wrap gap-3">
                {roteiro.courtesy.map((item: string, idx: number) => (
                  <div key={`${item}-${idx}`} className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                    <span className="text-sm text-stone-700 font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {roteiro.vehicle && (
            <div className="mb-12">
              <h4 className="font-bold text-stone-900 mb-6 flex items-center gap-2">
                <Car className="w-5 h-5 text-orange-600" /> Veículo Utilizado
              </h4>
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-stone-900 block">{roteiro.vehicle}</span>
                  <span className="text-xs text-stone-500">Veículo executivo com ar-condicionado e seguro passageiro</span>
                </div>
              </div>
            </div>
          )}

          {roteiro.flyer && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-stone-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-orange-600" /> Flyer do Roteiro
                </h4>
                <button 
                  onClick={() => onDownload(roteiro.flyer, `flyer-${roteiro.title.toLowerCase().replace(/\s+/g, '-')}.jpg`)}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-black/10"
                >
                  <Download className="w-4 h-4" />
                  Baixar Flyer
                </button>
              </div>
              <div className="rounded-3xl overflow-hidden border border-stone-200 shadow-lg">
                <FadeInImage src={roteiro.flyer} alt="Flyer" className="w-full h-auto" />
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-stone-100">
            <div className="flex flex-col gap-2">
              <div>
                <span className="text-xs text-stone-400 block uppercase font-bold tracking-widest mb-1">Investimento Geral</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-orange-600">R$ {roteiro.price}</span>
                  <span className="text-sm font-medium text-stone-400">/4 pessoas</span>
                </div>
              </div>
              {(roteiro.priceCash || roteiro.priceInstallment) && (
                <div className="flex gap-4 bg-stone-50 p-3 rounded-xl border border-stone-100 mt-1">
                  {roteiro.priceCash && (
                    <div>
                      <span className="text-[9px] font-bold text-stone-400 uppercase block">À Vista</span>
                      <span className="text-sm font-black text-green-600">R$ {roteiro.priceCash}</span>
                    </div>
                  )}
                  {roteiro.priceInstallment && (
                    <div>
                      <span className="text-[9px] font-bold text-stone-400 uppercase block">Parcelado</span>
                      <span className="text-sm font-black text-orange-600">R$ {roteiro.priceInstallment}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <a 
              href={`https://wa.me/${contactInfo.whatsapp}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full md:w-auto bg-green-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-600/20"
            >
              <MessageCircle className="w-5 h-5" />
              Reservar via WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RoteiroModal;
