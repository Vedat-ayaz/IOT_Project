import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Portal, Dialog } from 'react-native-paper';
import { Slider } from '@react-native-community/slider';
import { theme } from '../theme/theme';

interface FlowRateSliderProps {
  visible: boolean;
  currentValue: number;
  minValue?: number;
  maxValue?: number;
  onConfirm: (value: number) => void;
  onCancel: () => void;
}

export const FlowRateSlider: React.FC<FlowRateSliderProps> = ({
  visible,
  currentValue,
  minValue = 0,
  maxValue = 20,
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState(currentValue);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel}>
        <Dialog.Title>Set Flow Rate</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.label}>
            Flow Rate: {value.toFixed(1)} L/min
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={minValue}
            maximumValue={maxValue}
            value={value}
            onValueChange={setValue}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.disabled}
            thumbTintColor={theme.colors.primary}
            step={0.5}
          />
          <View style={styles.range}>
            <Text style={styles.rangeText}>{minValue} L/min</Text>
            <Text style={styles.rangeText}>{maxValue} L/min</Text>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onCancel}>Cancel</Button>
          <Button onPress={() => onConfirm(value)} mode="contained">
            Set Flow Rate
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  range: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  rangeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
