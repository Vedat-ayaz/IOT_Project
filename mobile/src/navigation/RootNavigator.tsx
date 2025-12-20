import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../auth/useAuth';
import { AuthStack } from './AuthStack';
import { AppTabs } from './AppTabs';
import { Loading } from '../components/Loading';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};
