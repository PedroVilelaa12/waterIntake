
import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { UserData } from '../types'; // Importa tipos do ficheiro types.ts
import { API_BASE_URL } from '../config'; // Importa a URL base da API

interface CadastroScreenProps {
  onUserIdentified: (user: UserData) => void;
}

const CadastroScreen: React.FC<CadastroScreenProps> = ({ onUserIdentified }) => {
  const [name, setName] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setError(null);
    setInfo(null);
    setIsLoading(true);

    if (!name.trim()) {
      setError('O nome é obrigatório.');
      setIsLoading(false);
      return;
    }

    try {
      setInfo('A verificar utilizador...');
      const loginResponse = await fetch(`${API_BASE_URL}/users/name/${encodeURIComponent(name.trim())}`);
      
      if (loginResponse.ok) {
        const userData = (await loginResponse.json()) as UserData;
        Alert.alert('Sucesso!', `Bem-vindo de volta, ${userData.name}!`);
        onUserIdentified(userData);
        return;
      } else if (loginResponse.status === 404) {
        setInfo('Utilizador não encontrado. Para registar um novo, preencha também o peso e tente novamente.');
        if (!weight.trim()) {
          setIsLoading(false);
          return; 
        }
        const parsedWeight = parseFloat(weight);
        if (isNaN(parsedWeight) || parsedWeight <= 0) {
          setError('Peso inválido para novo registo.');
          setIsLoading(false);
          return;
        }
        
        setInfo('A registar novo utilizador...');
        const registerResponse = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), weight_kg: parsedWeight }),
        });
        const responseData = await registerResponse.json();

        if (!registerResponse.ok) {
          const errorDetail = (responseData as any).detail; 
          throw new Error( errorDetail || `Erro ao registar: ${registerResponse.statusText}`);
        }
        const newUserData = responseData as UserData;
        Alert.alert('Sucesso!', `Utilizador "${newUserData.name}" registado!`);
        onUserIdentified(newUserData);
        return;
      } else {
        const errorData = await loginResponse.json();
        throw new Error(errorData.detail || 'Erro ao verificar utilizador.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao comunicar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Entrar ou Registar</Text>
      <Text style={styles.instructions}>Insira o seu nome. Se já existir, entrará. Caso contrário, adicione o peso para se registar.</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        value={name}
        onChangeText={setName}
        editable={!isLoading}
        placeholderTextColor="#9AA0A6"
      />
      <TextInput
        style={styles.input}
        placeholder="Peso (kg) - para novo registo"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        editable={!isLoading}
        placeholderTextColor="#9AA0A6"
      />
      {info && <Text style={styles.infoText}>{info}</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Aguarde...' : 'Continuar'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center', // Centraliza o conteúdo verticalmente no ecrã de cadastro
    alignItems: 'center', // Centraliza o conteúdo horizontalmente
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  input: {
    height: 50,
    width: '100%', 
    maxWidth: 400,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%', 
    maxWidth: 400,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  infoText: { 
    color: '#3b82f6',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default CadastroScreen;