
import React, { useState, useEffect } from 'react';
import CadastroScreen from './components/CadastroScreen';
import DashboardScreen from './components/DashboardScreen';
import HistoricoScreen from './components/HistoricoScreen';


export default function App() {
  const [currentScreen, setCurrentScreen] = useState('cadastro'); 
  const [currentUser, setCurrentUser] = useState(null); 

  useEffect(() => {
    const storedUser = localStorage.getItem('waterAppUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.id && user.name && user.weight_kg) { 
            setCurrentUser(user);
            setCurrentScreen('dashboard'); 
        } else {
            localStorage.removeItem('waterAppUser'); 
        }
      } catch (e) {
        console.error("Erro ao analisar utilizador do localStorage:", e);
        localStorage.removeItem('waterAppUser'); 
      }
    }
  }, []);


  const handleUserRegisteredOrLoggedIn = (userData) => {
    if (userData && userData.id && userData.name && userData.weight_kg) { 
        setCurrentUser(userData);
        localStorage.setItem('waterAppUser', JSON.stringify(userData)); 
        setCurrentScreen('dashboard');
    } else {
        console.error("Tentativa de registar/logar com dados de utilizador inválidos:", userData);

    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('waterAppUser');
    setCurrentScreen('cadastro');
  }

  let screenComponent;
  if (!currentUser || currentScreen === 'cadastro') {
    screenComponent = <CadastroScreen onUserRegistered={handleUserRegisteredOrLoggedIn} />;
  } else if (currentScreen === 'dashboard') {
    screenComponent = <DashboardScreen 
                        currentUser={currentUser} 
                        onLogout={handleLogout} 
                        navigateToHistory={() => setCurrentScreen('historico')} 
                      />;
  } else if (currentScreen === 'historico') {
    screenComponent = <HistoricoScreen 
                        currentUser={currentUser} 
                        navigateToDashboard={() => setCurrentScreen('dashboard')} 
                      />;
  } else {
    screenComponent = <CadastroScreen onUserRegistered={handleUserRegisteredOrLoggedIn} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-8 px-4 flex flex-col items-center">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700">
          💧 Lembrete de Beber Água 💧
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Mantenha-se hidratado e saudável!</p>
      </header>
      <main className="w-full max-w-2xl">
        {screenComponent}
      </main>
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} App Lembrete de Água. Desenvolvido para Teste Técnico.</p>
      </footer>
    </div>
  );
}
