
import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { UserData, DailyProgressData } from '../types';
import { API_BASE_URL } from '../config';

interface HistoricoScreenProps {
  currentUser: UserData;
  navigateToDashboard: () => void;
}

const HistoricoScreen: React.FC<HistoricoScreenProps> = ({ currentUser, navigateToDashboard }) => {
  const [history, setHistory] = useState<DailyProgressData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser || !currentUser.id) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/history`);
        const data = (await response.json()) as DailyProgressData[];
        if (!response.ok) {
          throw new Error((data as any).detail || 'Erro ao buscar histórico.');
        }
        setHistory(data);
      } catch (err: any) {
        setError(err.message || "Falha ao buscar histórico.");
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser.id]);

  const renderHistoryItem = ({ item }: { item: DailyProgressData }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyDate}>{new Date(item.date + 'T00:00:00Z').toLocaleDateString()}</Text>
      <Text>Consumido: {item.consumed_ml} mL / Meta: {item.daily_goal_ml.toFixed(0)} mL</Text>
      {item.goal_achieved ? <Text style={styles.goalAchievedTextSmall}>Meta Atingida!</Text> : <Text style={styles.goalNotAchievedTextSmall}>Meta não atingida</Text>}
    </View>
  );

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Histórico de Consumo</Text>
      {isLoading && <ActivityIndicator size="large" color="#1e3a8a" style={{marginVertical: 20}}/>}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!isLoading && history.length === 0 && !error && <Text style={styles.infoText}>Nenhum histórico encontrado.</Text>}
      {!isLoading && history.length > 0 && (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.date + item.user_id.toString()}
          style={{width: '100%'}}
        />
      )}
      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={navigateToDashboard}>
        <Text style={styles.buttonText}>Voltar ao Painel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center', // Centraliza o conteúdo da FlatList e do botão
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 20, // Aumentado para dar espaço antes da lista/loading
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20, // Aumentado para dar espaço após a lista/loading
    width: '100%', 
    maxWidth: 400,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#64748b',
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
  historyItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
    maxWidth: 400, 
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 5,
  },
  goalAchievedTextSmall: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: 'bold',
    marginTop: 3,
  },
  goalNotAchievedTextSmall: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 3,
  },
});

export default HistoricoScreen;