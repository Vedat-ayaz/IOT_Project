import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { theme } from '../../theme/theme';

export const AdminPanelScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>User Management</Text>
          <Text style={styles.cardDescription}>
            Manage users, assign roles, and control access
          </Text>
          <Button mode="contained" style={styles.button}>
            Manage Users
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Device Management</Text>
          <Text style={styles.cardDescription}>
            Register new devices, assign to users, and manage device lifecycle
          </Text>
          <Button mode="contained" style={styles.button}>
            Manage Devices
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>System Overview</Text>
          <Text style={styles.cardDescription}>
            View system statistics and health metrics
          </Text>
          <Button mode="contained" style={styles.button}>
            View Overview
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  button: {
    marginTop: theme.spacing.sm,
  },
});
