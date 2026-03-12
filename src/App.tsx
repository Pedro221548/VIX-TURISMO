/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, serverTimestamp, increment, setDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, analytics } from './firebase';
import { logEvent } from 'firebase/analytics';
import { 
  Utensils, 
  MapPin, 
  Camera, 
  Image as ImageIcon,
  Menu,
  X,
  ArrowRight,
  MessageCircle,
  BookOpen,
  Clock,
  Download,
  Plus,
  Settings,
  ShieldCheck,
  Car,
  Sparkles
} from 'lucide-react';

import { INITIAL_ROTEIROS, INITIAL_FROTA } from './constants';
import FadeInImage from './components/FadeInImage';
import Hero from './components/Hero';
import About from './components/About';
import Roteiros from './components/Roteiros';
import Instagram from './components/Instagram';
import Gallery from './components/Gallery';
import Fleet from './components/Fleet';
import Contact from './components/Contact';
import Footer from './components/Footer';

const AdminPanel = lazy(() => import('./components/AdminPanel'));

function RoteiroModal({ roteiro, onClose, contactInfo, onDownload }: { roteiro: any, onClose: () => void, contactInfo: any, onDownload: (url: string, filename: string) => void, key?: string }) {
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
}

function BookingModal({ isOpen, onClose, roteiroTitle, contactInfo }: { isOpen: boolean, onClose: () => void, roteiroTitle: string, contactInfo: any, key?: string }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const hour = new Date().getHours();
    let greeting = "bom dia";
    if (hour >= 12 && hour < 18) greeting = "boa tarde";
    else if (hour >= 18 || hour < 5) greeting = "boa noite";

    // Format date to DD/MM/YYYY for the message
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
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedRoteiro, setSelectedRoteiro] = useState<any>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<'roteiros' | 'gallery' | 'frota' | 'analytics'>('roteiros');
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowCookieConsent(true);
    }
  }, []);

  useEffect(() => {
    // Track page view in Firestore for custom admin dashboard
    const trackVisit = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const visitRef = doc(db, 'analytics_visits', today);
        await setDoc(visitRef, {
          date: today,
          count: increment(1),
          lastVisit: serverTimestamp()
        }, { merge: true });

        // Also track in standard Firebase Analytics
        if (analytics) {
          logEvent(analytics, 'page_view', {
            page_title: 'Home',
            page_location: window.location.href,
            page_path: window.location.pathname
          });
        }
      } catch (error) {
        console.error("Erro ao rastrear visita:", error);
      }
    };

    trackVisit();
  }, []);

  const [loading, setLoading] = useState(true);
  const [roteiros, setRoteiros] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [frota, setFrota] = useState<any[]>(INITIAL_FROTA);
  const [contactInfo, setContactInfo] = useState<any>({
    phone: '5527998597568',
    whatsapp: '5527998597568',
    instagram: 'https://instagram.com/citytoures',
    facebook: 'https://facebook.com/citytoures',
    email: 'contato@citytoures.com.br'
  });

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      window.open(url, '_blank');
    }
  };

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAdminLoggedIn(!!user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const unsubscribeRoteiros = onSnapshot(collection(db, 'roteiros'), (snapshot) => {
      if (snapshot.empty) {
        setRoteiros(INITIAL_ROTEIROS);
      } else {
        const rotData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRoteiros(rotData);
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar roteiros", error.message);
      setRoteiros(INITIAL_ROTEIROS);
      setLoading(false);
    });

    const unsubscribeGallery = onSnapshot(collection(db, 'gallery'), (snapshot) => {
      const galData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGallery(galData);
    }, (error) => {
      console.error("Erro ao carregar galeria", error.message);
    });

    const unsubscribeFrota = onSnapshot(collection(db, 'frota'), (snapshot) => {
      if (snapshot.empty) {
        setFrota(INITIAL_FROTA);
      } else {
        const frotaData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFrota(frotaData);
      }
    }, (error) => {
      console.error("Erro ao carregar frota", error.message);
      setFrota(INITIAL_FROTA);
    });

    return () => {
      unsubscribeRoteiros();
      unsubscribeGallery();
      unsubscribeFrota();
    };
  }, []);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingRoteiro, setBookingRoteiro] = useState<any>(null);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] font-sans selection:bg-orange-100 selection:text-orange-900">
      <div className="grain" />
      <AnimatePresence>
        {isBookingModalOpen && (
          <BookingModal 
            key="booking-modal"
            isOpen={isBookingModalOpen} 
            onClose={() => setIsBookingModalOpen(false)} 
            roteiroTitle={bookingRoteiro?.title || ''} 
            contactInfo={contactInfo}
          />
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Button */}
      <motion.a 
        href={`https://wa.me/${contactInfo.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 z-[100] bg-green-500 text-white p-4 rounded-full shadow-2xl shadow-green-500/40 flex items-center justify-center group"
      >
        <MessageCircle className="w-8 h-8" />
        <span className="absolute right-full mr-4 bg-white text-stone-900 px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-stone-100">
          Fale Conosco
        </span>
      </motion.a>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.imgur.com/3hNeKBx.png" 
              alt="VIX ES TURISMO Logo" 
              className="h-14 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <span className={`font-display font-black text-xl tracking-tight ${scrolled ? 'text-stone-900' : 'text-white'}`}>
              VIX ES TURISMO
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Roteiros', 'Frota', 'Galeria'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className={`text-sm font-medium hover:text-orange-600 transition-colors ${scrolled ? 'text-stone-600' : 'text-white/90'}`}
              >
                {item}
              </a>
            ))}
            <a 
              href={`https://wa.me/${contactInfo.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
            >
              Planejar Viagem
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className={scrolled ? 'text-stone-900' : 'text-white'} />
            ) : (
              <Menu className={scrolled ? 'text-stone-900' : 'text-white'} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {['Roteiros', 'Frota', 'Galeria'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-semibold text-stone-900 border-b border-stone-100 pb-4"
                >
                  {item}
                </a>
              ))}
              <a 
                href={`https://wa.me/${contactInfo.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-600 text-white w-full py-4 rounded-2xl text-lg font-bold mt-4 text-center"
              >
                Planejar Viagem
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Admin Button when logged in */}
      {isAdminLoggedIn && !showAdmin && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setShowAdmin(true)}
          className="fixed bottom-24 right-6 z-[90] bg-stone-900 text-white p-4 rounded-full shadow-2xl hover:bg-stone-800 transition-transform hover:scale-110 flex items-center justify-center group"
          title="Abrir Painel Administrativo"
        >
          <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </motion.button>
      )}

      {/* Cookie Consent */}
      <AnimatePresence>
        {showCookieConsent && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[100]"
          >
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 backdrop-blur-xl bg-white/90">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-stone-900">Cookies & Privacidade</h4>
                  <p className="text-sm text-stone-500 leading-relaxed mt-1">
                    Utilizamos cookies para melhorar sua experiência e analisar o tráfego do site.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    localStorage.setItem('cookie-consent', 'accepted');
                    setShowCookieConsent(false);
                  }}
                  className="flex-1 bg-stone-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors"
                >
                  Aceitar
                </button>
                <button
                  onClick={() => setShowCookieConsent(false)}
                  className="px-6 py-3 text-stone-400 hover:text-stone-600 text-sm font-bold transition-colors"
                >
                  Recusar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        {showAdmin && (
          <AdminPanel onClose={() => setShowAdmin(false)} initialTab={adminTab as any} />
        )}
      </Suspense>

      <AnimatePresence>
        {selectedRoteiro && (
          <RoteiroModal 
            key="roteiro-modal"
            roteiro={selectedRoteiro} 
            onClose={() => setSelectedRoteiro(null)} 
            contactInfo={contactInfo}
            onDownload={handleDownload}
          />
        )}
      </AnimatePresence>

      <Hero contactInfo={contactInfo} />
      <About />
      <Roteiros 
        roteiros={roteiros} 
        setSelectedRoteiro={setSelectedRoteiro} 
        setBookingRoteiro={setBookingRoteiro} 
        setIsBookingModalOpen={setIsBookingModalOpen} 
      />
      <Instagram />
      <Gallery gallery={gallery} />
      <Fleet frota={frota} />
      <Contact contactInfo={contactInfo} />
      <Footer contactInfo={contactInfo} />
    </div>
  );
}
