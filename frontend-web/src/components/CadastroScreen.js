
import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

function CadastroScreen({ onUserRegistered }) {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTryingLogin, setIsTryingLogin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsLoading(true);
    setIsTryingLogin(false); 

    if (!name.trim()) { 
      setError('O nome é obrigatório.');
      setIsLoading(false);
      return;
    }

    try {
      setInfo('A verificar se o utilizador já existe...');
      setIsTryingLogin(true);
      const loginResponse = await fetch(`${API_BASE_URL}/users/name/${encodeURIComponent(name.trim())}`);
      
      if (loginResponse.ok) {
        const userData = await loginResponse.json();
        setInfo(`Utilizador "${userData.name}" encontrado. A entrar...`);
        onUserRegistered(userData);

        return;
      } else if (loginResponse.status === 404) {
        setInfo('Utilizador não encontrado. Para registar um novo utilizador, preencha o peso.');
        setIsTryingLogin(false); 

        if (!weight.trim()) { 
          setError('Peso é obrigatório para registar um novo utilizador.');
          setIsLoading(false);
          return; 
        }

        const parsedWeight = parseFloat(weight);
        if (isNaN(parsedWeight) || parsedWeight <= 0) {
          setError('Peso inválido. Deve ser um número maior que zero.');
          setIsLoading(false);
          return;
        }


        setInfo('A registar novo utilizador...');
        const registerResponse = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), weight_kg: parsedWeight }),
        });

        const newUserData = await registerResponse.json(); // Tenta obter JSON mesmo em erro para 'detail'
        if (!registerResponse.ok) {
          throw new Error(newUserData.detail || `Erro ao registar: ${registerResponse.statusText}`);
        }
        onUserRegistered(newUserData);

        return;

      } else {
        const errorData = await loginResponse.json();
        throw new Error(errorData.detail || `Erro ao verificar utilizador: ${loginResponse.statusText}`);
      }
    } catch (err) {

      setError(err.message || 'Não foi possível ligar à API.');
    } finally {

      if (!error && !info.includes("encontrado. A entrar...")) { 
           setInfo(''); 
      }
       setIsLoading(false); 
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Entrar ou Registar</h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        Insira o seu nome. Se já estiver registado, entrará automaticamente. Caso contrário, preencha também o peso para se registar.
      </p>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
      {info && !error && <p className="bg-blue-100 text-blue-700 p-3 rounded-md mb-4 text-sm">{info}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="O seu nome completo"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Peso (kg) <span className="text-xs text-gray-400">(Necessário para novo registo)</span>:</label>
          <input
            type="number"
            id="weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ex: 70.5"
            step="0.1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50"
        >
          {isLoading ? 'A processar...' : 'Entrar / Registar'}
        </button>
      </form>
    </div>
  );
}

export default CadastroScreen;