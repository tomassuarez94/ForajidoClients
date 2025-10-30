// ✅ App.js
import React, { useState, useEffect } from 'react';
import { Music, Send, CheckCircle, List, Trash2, Martini, MessageSquare } from 'lucide-react';
import { db } from './firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';

import logo from './logo.png';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";





export default function MusicRequestApp() {
  // debajo de: export default function MusicRequestApp() {
  const [section, setSection] = useState('home'); // 'home' | 'client' | 'promos' | 'admin'
  const [view, setView] = useState('client');
  const [clientName, setClientName] = useState('');
  const [songRequest, setSongRequest] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [requests, setRequests] = useState([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;


  // 🔔 Pedir permiso de notificación una vez
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);



  useEffect(() => {
    if (isAdmin) {
      const q = query(collection(db, "requests"), orderBy("timestamp", "desc"));
      let firstLoad = true;
      let previousIds = [];
      let lastData = [];

      // 🔁 Escucha en tiempo real (mientras esté activa)
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const newRequests = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Detectar nuevos registros para notificar
          if (!firstLoad) {
            const newOnes = newRequests.filter(
              (r) => !previousIds.includes(r.id)
            );
            if (newOnes.length > 0 && Notification.permission === "granted") {
              const latest = newOnes[0];
              new Notification("🎵 Nueva canción solicitada", {
                body: `${latest.name} pidió: ${latest.song}`,
                icon: "/logo.png",
              });
              if (window.navigator.vibrate) navigator.vibrate(200);
            }
          } else {
            firstLoad = false;
          }

          previousIds = newRequests.map((r) => r.id);
          lastData = newRequests;
          setRequests(newRequests);
        },
        (error) => {
          console.error("🔥 Firestore snapshot error:", error);
        }
      );

      // ⚡ Refresco activo cada 15 segundos (si el snapshot se duerme)
      const interval = setInterval(async () => {
        try {
          const docsSnap = await getDocs(q);
          const refreshedData = docsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));

          // Si hay cambios respecto al último snapshot, actualiza manualmente
          const changed =
            JSON.stringify(refreshedData) !== JSON.stringify(lastData);
          if (changed) {
            console.log("📲 Refrescando datos móviles...");
            setRequests(refreshedData);
          }
        } catch (err) {
          console.warn("❌ Error en refresco manual:", err.message);
        }
      }, 15000); // cada 15 segundos

      return () => {
        unsubscribe();
        clearInterval(interval);
      };
    }
  }, [isAdmin]);




  const handleSubmitRequest = async () => {
    if (!clientName.trim() || !songRequest.trim()) return;
    try {
      await addDoc(collection(db, 'requests'), {
        name: clientName.trim(),
        song: songRequest.trim(),
        timestamp: Date.now()
      });
      setSubmitted(true);
      setTimeout(() => {
        setClientName('');
        setSongRequest('');
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
    }
  };

  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);


  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      setIsAdmin(true);
    } catch (error) {
      console.error("Error en login:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdmin(false);
  };


  const handleDeleteRequest = async (id) => {
    try {
      await deleteDoc(doc(db, 'requests', id));
    } catch (error) {
      console.error('Error al eliminar solicitud:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };


  // ⬇️ Home
  if (section === 'home') {
    return (
      <div className="min-h-screen bg-forajido-premium flex items-center justify-center p-6">
        <div className="bg-[#141414]/90 backdrop-blur-md border border-[#C6A664]/30 rounded-3xl shadow-xl p-10 w-full max-w-md text-center text-[#F5F5F5]">
          {/* LOGO */}
          <img
            src={logo}
            alt="Forajido Bar Logo"
            className="w-24 h-24 mx-auto mb-6 object-contain drop-shadow-[0_0_12px_rgba(198,166,100,0.3)]"
          />

          {/* TÍTULO */}
          <h1 className="text-3xl font-bold text-[#FFD166] mb-10 tracking-wide">
            Bienvenido a Forajido
          </h1>

          {/* BOTONES */}
          <div className="space-y-5">
            {/* 🥂 Promos */}
            <a
              href="https://drive.google.com/file/d/14JAXOWQUb0jrC0Tl672H1DV3eypo3QVA/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-[#C6A664] to-[#BFA76F] text-black font-semibold py-4 rounded-xl hover:brightness-110 transition-all duration-300 shadow-md"
            >
              <Martini className="w-5 h-5 text-black" />
              <span>Promociones 2x1</span>
            </a>

            {/* 🎶 Solicitar canción */}
            <button
              onClick={() => setSection('client')}
              className="flex items-center justify-center gap-3 w-full bg-[#0A0A0A] text-[#FFD166] font-semibold py-4 rounded-xl hover:bg-[#1E1E1E] transition-all duration-300 shadow-md border border-[#C6A664]/40"
            >
              <Music className="w-5 h-5 text-[#FFD166]" />
              <span>Solicitar canción</span>
            </button>

            {/* 💬 Califica tu visita */}
            <a
              href="https://tally.so/r/w5yrod"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-black font-semibold py-4 rounded-xl hover:brightness-110 transition-all duration-300 shadow-md"
            >
              <MessageSquare className="w-5 h-5 text-black" />
              <span>Califica tu visita</span>
            </a>
          </div>

          {/* Acceso Admin */}
          <button
            onClick={() => {
              setView('admin');
              setSection('admin');
            }}
            className="w-full mt-8 text-[#cfcfcf] text-sm hover:text-white transition-colors"
          >
            Acceso administrador
          </button>
        </div>
      </div>
    );
  }





  if (view === 'admin' && !isAdmin) {
    return (
      <div className="min-h-screen bg-forajido-premium flex items-center justify-center p-4">
        <div className="bg-[#CFCFCF]/90 rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <List className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Panel de Administrador</h2>
          </div>
          <div>

            <button
              onClick={handleGoogleLogin}
              className="w-full bg-gradient-to-r from-[#C6A664] to-[#BFA76F] text-black font-semibold py-4 rounded-xl text-lg tracking-wide shadow-md hover:brightness-110 transition-all duration-300"
            >
              Login
            </button>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => { setIsAdmin(false); setView('client'); setSection('home'); }}
                className="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'admin' && isAdmin) {
    return (
      <div className="min-h-screen bg-forajido-premium">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Solicitudes de Música</h2>
            <button
              onClick={() => { setIsAdmin(false); setView('client'); setSection('home'); }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Salir
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No hay solicitudes todavía</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="bg-white rounded-xl shadow-lg p-5 flex justify-between items-start hover:shadow-xl transition-shadow">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Music className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-800">{r.name}</span>
                      <span className="text-sm text-gray-500">{formatTime(r.timestamp)}</span>
                    </div>
                    <p className="text-gray-700 text-lg pl-7">{r.song}</p>
                  </div>
                  <button onClick={() => handleDeleteRequest(r.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forajido-premium flex items-center justify-center p-4">
      <div className="bg-[#141414]/90 backdrop-blur-md border border-[#C6A664]/30 rounded-3xl shadow-xl p-10 w-full max-w-md text-center text-[#F5F5F5]">
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Forajido Bar Logo"
            className="w-24 h-24 mx-auto mb-4 object-contain drop-shadow-[0_0_12px_rgba(198,166,100,0.3)]"
          />

          <h1 className="text-3xl font-bold text-[#FFD166] mb-2">Solicita tu Canción</h1>
          <p className="text-white-600">¿Qué te gustaría escuchar?</p>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Solicitud Enviada!</h2>
            <p className="text-gray-600">El DJ revisará tu petición</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-white-700 font-semibold mb-2">Tu Nombre</label>
              <input
                type="text"
                placeholder="Ej: Juan"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-forajidoAccent"
              />

              <textarea
                placeholder="Ej: Despacito - Luis Fonsi"
                value={songRequest}
                onChange={(e) => setSongRequest(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-forajidoAccent resize-none mt-4"
                rows="3"
              />

            </div>
            <button
              onClick={handleSubmitRequest}
              className="w-full bg-gradient-to-r from-[#C6A664] to-[#BFA76F] text-black font-semibold py-4 rounded-xl text-lg tracking-wide shadow-md hover:brightness-110 hover:shadow-yellow-500/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Enviar Solicitud
            </button>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => { setIsAdmin(false); setView('client'); setSection('home'); }}
                className="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Salir
              </button>
            </div>


          </div>
        )}

        <button
          onClick={() => setView('admin')}
          className="w-full mt-6 text-gray-500 text-sm hover:text-gray-700 transition-colors"
        >
          Acceso administrador
        </button>
      </div>
    </div>
  );
}