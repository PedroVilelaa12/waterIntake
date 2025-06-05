
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

function HistoricoScreen({ currentUser, navigateToDashboard }) { // Renomeado setCurrentScreen para navigateToDashboard
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || !currentUser.id) {
      setHistory([]); 
      return;
    }
    const fetchHistory = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/history`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Erro ao buscar histórico.');
        }
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
        console.error("Falha ao buscar histórico:", err);
        setHistory([]); // Limpa histórico em caso de erro
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser]); // Removido currentUser.id, pois currentUser já cobre a mudança de id

  if (!currentUser) {
    // Esta lógica agora é gerida pelo App.js
    return <p>Utilizador não encontrado. Por favor, volte ao registo.</p>;
  }

  return (
    <div className="container mx-auto p-4 max-w-xl bg-white shadow-xl rounded-lg">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-blue-700">Histórico de Consumo</h2>
        <button
          onClick={navigateToDashboard}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow"
        >
          Voltar ao Painel
        </button>
      </div>

      {isLoading && <p className="text-center text-blue-600 py-4">A carregar histórico...</p>}
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
      
      {!isLoading && history.length === 0 && !error && (
        <p className="text-center text-gray-500 py-4">Ainda não há registos no histórico.</p>
      )}

      {!isLoading && history.length > 0 && (
        <div className="space-y-4">
          {history.map((record) => (
            <div key={record.date + record.user_id} className={`p-4 rounded-lg shadow-md border-l-4 ${record.goal_achieved ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}`}>
              <p className="text-lg font-semibold text-gray-800">Data: {new Date(record.date + 'T00:00:00').toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Meta: {record.daily_goal_ml.toFixed(0)} mL</p>
              <p className="text-sm text-gray-600">Consumido: <span className="font-bold">{record.consumed_ml} mL</span></p>
              {record.goal_achieved ? (
                <p className="text-sm font-semibold text-green-600">Meta Atingida!</p>
              ) : (
                <p className="text-sm font-semibold text-orange-500">Meta Não Atingida (Faltaram: {record.remaining_ml.toFixed(0)} mL)</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoricoScreen;