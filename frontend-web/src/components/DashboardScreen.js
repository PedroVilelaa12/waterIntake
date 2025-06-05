
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

function DashboardScreen({ currentUser, onLogout, navigateToHistory }) { // Renomeado setCurrentUser para onLogout e setCurrentScreen para navigateToHistory
  const [dailyProgress, setDailyProgress] = useState(null);
  const [intakeAmount, setIntakeAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Para registo de consumo
  const [isLoadingProgress, setIsLoadingProgress] = useState(false); // Para carregar progresso

  const fetchDailyProgress = async () => {
    if (!currentUser || !currentUser.id) return;
    setIsLoadingProgress(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/daily_progress`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao buscar progresso.');
      }
      const data = await response.json();
      setDailyProgress(data);
    } catch (err) {
      setError(err.message);
      console.error("Falha ao buscar progresso:", err);
      setDailyProgress(null); // Limpa progresso em caso de erro
    } finally {
      setIsLoadingProgress(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchDailyProgress();
    } else {
      setDailyProgress(null); 
    }
  }, [currentUser]); // Removido currentUser.id, pois currentUser já cobre a mudança de id

  const handleLogIntake = async (e) => {
    e.preventDefault();
    if (!intakeAmount || isNaN(parseInt(intakeAmount)) || parseInt(intakeAmount) <= 0) {
      setError('Por favor, insira uma quantidade válida em mL.');
      return;
    }
    setError('');
    setIsLoading(true); // Usar isLoading para o form
    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/water_intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_ml: parseInt(intakeAmount) }),
      });
      const responseData = await response.json(); // Tenta ler JSON mesmo em erro
      if (!response.ok) {
        throw new Error(responseData.detail || 'Erro ao registar consumo.');
      }
      setIntakeAmount(''); 
      fetchDailyProgress(); 
    } catch (err) {
      setError(err.message);
      console.error("Falha ao registar consumo:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    // Esta lógica agora é gerida pelo App.js, mas pode ser um fallback
    return <p>Utilizador não encontrado. Por favor, volte ao registo.</p>;
  }
  
  const progressPercentage = dailyProgress && dailyProgress.daily_goal_ml > 0 
    ? (dailyProgress.consumed_ml / dailyProgress.daily_goal_ml) * 100
    : 0;

  return (
    <div className="container mx-auto p-4 max-w-lg bg-white shadow-xl rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-700">Painel de Controlo</h2>
        <button
            onClick={onLogout} 
            className="text-sm bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-lg shadow"
        >
            Sair (Trocar Utilizador)
        </button>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-6">
        <p className="text-xl font-semibold text-gray-800">Olá, {currentUser.name}!</p>
        <p className="text-gray-600">O seu ID: {currentUser.id}</p>
        <p className="text-gray-600">Peso: {currentUser.weight_kg} kg</p>
        {dailyProgress && <p className="text-gray-600">Meta Diária: <span className="font-semibold">{dailyProgress.daily_goal_ml.toFixed(0)} mL</span></p>}
      </div>

      {isLoadingProgress && <p className="text-center text-blue-600">A carregar progresso...</p>}
      {error && !isLoadingProgress && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
      
      {dailyProgress && !isLoadingProgress && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Progresso de Hoje ({new Date(dailyProgress.date + 'T00:00:00').toLocaleDateString()})</h3>
          <div className="w-full bg-gray-200 rounded-full h-6 mb-2 overflow-hidden shadow-inner">
            <div
              className="bg-green-500 h-6 rounded-full text-xs font-medium text-blue-100 text-center p-1 leading-none transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            >
              {progressPercentage.toFixed(0)}%
            </div>
          </div>
          <p className="text-md text-gray-600">Consumido: <span className="font-bold text-green-600">{dailyProgress.consumed_ml} mL</span></p>
          <p className="text-md text-gray-600">Faltam: <span className="font-bold text-orange-600">{dailyProgress.remaining_ml.toFixed(0)} mL</span></p>
          {dailyProgress.goal_achieved ? (
            <p className="text-lg font-semibold text-green-500 mt-2">🎉 Meta atingida! Parabéns! 🎉</p>
          ) : (
            <p className="text-lg font-semibold text-orange-500 mt-2">Continue a beber água!</p>
          )}
        </div>
      )}

      <form onSubmit={handleLogIntake} className="space-y-4 mb-6">
        <div>
          <label htmlFor="intake" className="block text-sm font-medium text-gray-700 mb-1">Registar Consumo (mL):</label>
          <input
            type="number"
            id="intake"
            value={intakeAmount}
            onChange={(e) => setIntakeAmount(e.target.value)}
            placeholder="Ex: 250"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50"
        >
          {isLoading ? 'A registar...' : 'Registar Consumo'}
        </button>
      </form>
      
      <button
        onClick={navigateToHistory}
        className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
      >
        Ver Histórico
      </button>
    </div>
  );
}

export default DashboardScreen;