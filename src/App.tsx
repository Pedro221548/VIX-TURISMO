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

const Roteiros = lazy(() => import('./components/Roteiros'));
const Instagram = lazy(() => import('./components/Instagram'));
const Gallery = lazy(() => import('./components/Gallery'));
const Fleet = lazy(() => import('./components/Fleet'));
const Contact = lazy(() => import('./components/Contact'));
const Footer = lazy(() => import('./components/Footer'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const RoteiroModal = lazy(() => import('./components/RoteiroModal'));
const BookingModal = lazy(() => import('./components/BookingModal'));

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
      <Suspense fallback={null}>
        {isBookingModalOpen && (
          <BookingModal 
            isOpen={isBookingModalOpen} 
            onClose={() => setIsBookingModalOpen(false)} 
            roteiroTitle={bookingRoteiro?.title || ''} 
            contactInfo={contactInfo}
          />
        )}
        {selectedRoteiro && (
          <RoteiroModal 
            roteiro={selectedRoteiro} 
            onClose={() => setSelectedRoteiro(null)} 
            contactInfo={contactInfo}
            onDownload={handleDownload}
          />
        )}
      </Suspense>
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
      <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div></div>}>
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
      </Suspense>
    </div>
  );
}
