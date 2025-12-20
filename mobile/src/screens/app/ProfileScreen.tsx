import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Avatar, Divider, TextInput, Portal, Dialog, Snackbar } from 'react-native-paper';
import { useAuth } from '../../auth/useAuth';
import { theme } from '../../theme/theme';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setSnackbarMessage("Passwords don't match");
      setSnackbarVisible(true);
      return;
    }

    if (newPassword.length < 6) {
      setSnackbarMessage('Password must be at least 6 characters');
      setSnackbarVisible(true);
      return;
    }

    // TODO: Implement password change API call
    setChangePasswordVisible(false);
    setSnackbarMessage('Password changed successfully');
    setSnackbarVisible(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const getInitials = () => {
    if (!user) return '?';
    return `${user.name[0]}${user.surname[0]}`.toUpperCase();
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={getInitials()}
            style={styles.avatar}
          />
          <Text style={styles.name}>
            {user?.name} {user?.surname}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{user?.name}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Surname:</Text>
            <Text style={styles.infoValue}>{user?.surname}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          {user?.phone && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.actionsCard}>
        <Card.Content>
          <Button
            mode="outlined"
            icon="lock-reset"
            onPress={() => setChangePasswordVisible(true)}
            style={styles.actionButton}
          >
            Change Password
          </Button>

          {user?.role === 'ADMIN' && (
            <Button
              mode="outlined"
              icon="shield-account"
              onPress={() => navigation.navigate('AdminPanel')}
              style={styles.actionButton}
            >
              Admin Panel
            </Button>
          )}

          <Button
            mode="contained"
            icon="logout"
            onPress={handleLogout}
            style={[styles.actionButton, styles.logoutButton]}
            buttonColor={theme.colors.error}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>

      <Portal>
        <Dialog
          visible={changePasswordVisible}
          onDismiss={() => setChangePasswordVisible(false)}
        >
          <Dialog.Title>Change Password</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Current Password"
              mode="outlined"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={styles.input}
            />
            <TextInput
              label="New Password"
              mode="outlined"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
            />
            <TextInput
              label="Confirm New Password"
              mode="outlined"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setChangePasswordVisible(false)}>Cancel</Button>
            <Button onPress={handleChangePassword}>Change</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileCard: {
    margin: theme.spacing.md,
    ...theme.shadows.medium,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  roleBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    margin: theme.spacing.md,
    marginTop: 0,
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  divider: {
    marginVertical: theme.spacing.xs,
  },
  actionsCard: {
    margin: theme.spacing.md,
    marginTop: 0,
    ...theme.shadows.small,
  },
  actionButton: {
    marginVertical: theme.spacing.xs,
  },
  logoutButton: {
    marginTop: theme.spacing.md,
  },
  input: {
    marginBottom: theme.spacing.sm,
  },
});
