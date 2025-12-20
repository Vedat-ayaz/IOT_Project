import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { theme } from '../theme/theme';

interface KPIWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
}

export const KPIWidget: React.FC<KPIWidgetProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = theme.colors.primary,
}) => {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: theme.spacing.xs,
    ...theme.shadows.small,
  },
  content: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
});
