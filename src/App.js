// ✅ App.js
import React, { useState, useEffect } from 'react';
import { Music, Send, CheckCircle, List, Trash2 } from 'lucide-react';
import { db } from './firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import logo from './logo.png';


export default function MusicRequestApp() {
  const [view, setView] = useState('client');
  const [clientName, setClientName] = useState('');
  const [songRequest, setSongRequest] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [requests, setRequests] = useState([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;



  useEffect(() => {
    if (isAdmin) {
      const q = query(collection(db, 'requests'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setRequests(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
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

  if (view === 'admin' && !isAdmin) {
    return (
      <div className="min-h-screen bg-forajido-premium flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <List className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Panel de Administrador</h2>
          </div>
          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && adminPassword === ADMIN_PASSWORD && setIsAdmin(true)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 mb-4"
            />
            <button
              onClick={() => adminPassword === ADMIN_PASSWORD && setIsAdmin(true)}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors mb-3"
            >
              Entrar
            </button>
            <button
              onClick={() => setView('client')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Volver
            </button>
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
              onClick={() => { setIsAdmin(false); setView('client'); }}
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
      <div className="bg-[#CFCFCF]/90 backdrop-blur-md border border-[#C6A664]/20 rounded-2xl shadow-lg shadow-black/50 p-8 w-full max-w-md text-[#F5F5F5]">
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Forajido Bar Logo"
            className="w-24 h-24 mx-auto mb-4 object-contain drop-shadow-[0_0_12px_rgba(198,166,100,0.3)]"
          />

          <h1 className="text-3xl font-bold text-gray-800 mb-2">Solicita tu Canción</h1>
          <p className="text-gray-600">¿Qué te gustaría escuchar?</p>
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
              <label className="block text-gray-700 font-semibold mb-2">Tu Nombre</label>
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
