import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Clock, ArrowRight } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roteiroTitle: string;
  contactInfo: any;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, roteiroTitle, contactInfo }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const hour = new Date().getHours();
    let greeting = "bom dia";
    if (hour >= 12 && hour < 18) greeting = "boa tarde";
    else if (hour >= 18 || hour < 5) greeting = "boa noite";

    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    const message = `Olá, ${greeting}.

Me chamo *${name}* e gostaria de obter mais informações sobre o *tour para ${roteiroTitle}* na data *${formattedDate}*.

Fico no aguardo do seu retorno.
Desde já, agradeço pela atenção.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${contactInfo.whatsapp}?text=${encodedMessage}`, '_blank');
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-stone-400" />
        </button>

        <div className="mb-8">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-display font-bold text-stone-900 mb-2">Solicitar Reserva</h2>
          <p className="text-stone-500 text-sm">Preencha os dados abaixo para iniciarmos seu atendimento via WhatsApp.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Seu Nome</label>
            <input 
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como podemos te chamar?"
              className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Data Desejada</label>
            <input 
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-stone-900/10 flex items-center justify-center gap-3 group"
          >
            <span>Continuar para WhatsApp</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default BookingModal;
