

import * as React from 'react';
import { useState } from 'react'; 
import {
  SafeAreaView,
  StyleSheet,
  View,
  Keyboard,
  TouchableWithoutFeedback,

} from 'react-native';

import CadastroScreen from './src/screens/CadastroScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import HistoricoScreen from './src/screens/HistoricoScreen';
import { UserData, ScreenName } from './src/types'; 

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('cadastro');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  const handleUserIdentified = (user: UserData) => {
    setCurrentUser(user);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('cadastro');
  };

  let screenComponent;
  if (!currentUser || currentScreen === 'cadastro') {
    screenComponent = <CadastroScreen onUserIdentified={handleUserIdentified} />;
  } else if (currentScreen === 'dashboard') {
    screenComponent = (
      <DashboardScreen
        currentUser={currentUser}
        onLogout={handleLogout}
        navigateToHistory={() => setCurrentScreen('historico')}
      />
    );
  } else if (currentScreen === 'historico') {
    screenComponent = (
      <HistoricoScreen
        currentUser={currentUser}
        navigateToDashboard={() => setCurrentScreen('dashboard')}
      />
    );
  } else {
    screenComponent = <CadastroScreen onUserIdentified={handleUserIdentified} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.appContainer}>
          {screenComponent}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8', 
  },
  appContainer: {
    flex: 1, 
  },
});

export default App;
