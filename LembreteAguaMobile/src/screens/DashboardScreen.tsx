
import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { UserData, DailyProgressData } from '../types';
import { API_BASE_URL } from '../config';

interface DashboardScreenProps {
  currentUser: UserData;
  onLogout: () => void;
  navigateToHistory: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ currentUser, onLogout, navigateToHistory }) => {
  const [progress, setProgress] = useState<DailyProgressData | null>(null);
  const [intakeAmount, setIntakeAmount] = useState<string>('');
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(false);
  const [isLoggingIntake, setIsLoggingIntake] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const dailyGoalMl = currentUser.weight_kg * 35; 

  const fetchDailyProgress = async () => {
    if (!currentUser || !currentUser.id) return;
    setIsLoadingProgress(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/daily_progress`);
      const data = (await response.json()) as DailyProgressData;
      if (!response.ok) {
        throw new Error((data as any).detail || 'Erro ao buscar progresso.');
      }
      setProgress(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao buscar progresso.');
      setProgress(null);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  useEffect(() => {
    fetchDailyProgress();
  }, [currentUser.id]);

  const handleLogIntake = async () => {
    Keyboard.dismiss();
    const amount = parseInt(intakeAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erro', 'Insira uma quantidade válida em mL.');
      return;
    }
    setIsLoggingIntake(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/water_intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_ml: amount }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error((responseData as any).detail || 'Erro ao registar consumo.');
      }
      setIntakeAmount('');
      fetchDailyProgress(); 
      Alert.alert('Sucesso!', `${amount} mL registados!`);
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Erro', err.message || "Falha ao registar consumo.");
    } finally {
      setIsLoggingIntake(false);
    }
  };
  
  const progressPercentage = progress && progress.daily_goal_ml > 0
    ? (progress.consumed_ml / progress.daily_goal_ml) * 100
    : 0;

  return (
    <ScrollView style={styles.screenContainer} contentContainerStyle={styles.scrollViewContent}>
      <Text style={styles.title}>Painel de Água</Text>
      <Text style={styles.subtitle}>Olá, {currentUser.name}!</Text>
      <Text style={styles.infoText}>Sua meta diária: {dailyGoalMl.toFixed(0)} mL</Text>
      
      {isLoadingProgress && <ActivityIndicator size="large" color="#1e3a8a" style={{marginVertical: 20}} />}
      {error && !isLoadingProgress && <Text style={styles.errorText}>{error}</Text>}

      {progress && !isLoadingProgress && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Consumido Hoje: {progress.consumed_ml} mL</Text>
          <Text style={styles.progressText}>Faltam: {progress.remaining_ml.toFixed(0)} mL</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${Math.min(progressPercentage, 100)}%` }]} />
          </View>
          <Text style={styles.progressPercentageText}>{progressPercentage.toFixed(0)}% da meta</Text>
          {progress.goal_achieved && <Text style={styles.goalAchievedText}>🎉 Meta atingida! 🎉</Text>}
        </View>
      )}

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Quantidade (mL)"
          value={intakeAmount}
          onChangeText={setIntakeAmount}
          keyboardType="numeric"
          editable={!isLoggingIntake}
          placeholderTextColor="#9AA0A6"
        />
        <TouchableOpacity
          style={[styles.button, styles.logButton, isLoggingIntake && styles.buttonDisabled]}
          onPress={handleLogIntake}
          disabled={isLoggingIntake}>
          <Text style={styles.buttonText}>{isLoggingIntake ? 'A Registar...' : 'Registar Água'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={navigateToHistory}>
        <Text style={styles.buttonText}>Ver Histórico</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={onLogout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    padding: 20,
  },
  scrollViewContent: { 
    flexGrow: 1, 
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: { 
    fontSize: 18,
    color: '#4b5563',
    marginBottom: 20,
    textAlign: 'center',
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
  secondaryButton: {
    backgroundColor: '#64748b',
    marginTop: 15,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    marginTop: 15,
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
  progressContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressText: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 5,
  },
  progressBarBackground: {
    width: '100%',
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 10,
  },
  progressPercentageText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 5,
  },
  goalAchievedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: 10,
  },
  inputGroup: { 
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
    alignItems: 'center',
  },
  logButton: {
    backgroundColor: '#16a34a',
  },
});

export default DashboardScreen;