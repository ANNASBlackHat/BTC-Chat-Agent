import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { colors } from '../theme';
import type { PositionPayload } from '../api';

interface PositionModalProps {
  visible: boolean;
  position: PositionPayload | null;
  onClose: () => void;
  onSave: (direction: 'long' | 'short', entryPrice: number) => Promise<void>;
  onClear: () => Promise<void>;
}

type Direction = 'long' | 'short';

export function PositionModal({ visible, position, onClose, onSave, onClear }: PositionModalProps) {
  const [direction, setDirection] = useState<Direction>('long');
  const [priceText, setPriceText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-seed the form each time the modal opens
  useEffect(() => {
    if (visible) {
      setDirection(position?.direction ?? 'long');
      setPriceText(position ? String(position.entry_price) : '');
      setError(null);
    }
  }, [visible, position]);

  const parsedPrice = Number(priceText.replace(/[, ]/g, ''));
  const priceValid = priceText.trim() !== '' && Number.isFinite(parsedPrice) && parsedPrice > 0;

  const handleSave = async () => {
    if (!priceValid || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(direction, parsedPrice);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save position.');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await onClear();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear position.');
    } finally {
      setSaving(false);
    }
  };

  const DirectionButton = ({ value, label }: { value: Direction; label: string }) => {
    const selected = direction === value;
    const selectedColor = value === 'long' ? colors.up : colors.down;
    return (
      <TouchableOpacity
        onPress={() => setDirection(value)}
        accessibilityRole="button"
        style={{
          flex: 1,
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1,
          alignItems: 'center',
          backgroundColor: selected ? selectedColor : colors.bg,
          borderColor: selected ? selectedColor : colors.cardBorder,
        }}
      >
        <Text
          style={{
            color: selected ? '#04110b' : colors.textMuted,
            fontWeight: '800',
            fontSize: 13,
            letterSpacing: 1,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: colors.card,
                borderTopWidth: 1,
                borderTopColor: colors.cardBorder,
                borderTopLeftRadius: 22,
                borderTopRightRadius: 22,
                padding: 20,
                paddingBottom: 34,
              }}
            >
              {/* Grab handle */}
              <View
                style={{
                  alignSelf: 'center',
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.cardBorder,
                  marginBottom: 16,
                }}
              />

              <Text
                style={{
                  color: colors.text,
                  fontSize: 15,
                  fontWeight: '800',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                My Position
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                Skin in the game — the agent frames analysis around your entry.
              </Text>

              {/* Direction toggle */}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
                <DirectionButton value="long" label="▲ LONG" />
                <DirectionButton value="short" label="▼ SHORT" />
              </View>

              {/* Entry price */}
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 10,
                  fontWeight: '700',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginTop: 18,
                  marginBottom: 6,
                }}
              >
                Entry Price (USD)
              </Text>
              <TextInput
                value={priceText}
                onChangeText={setPriceText}
                placeholder="e.g. 67500"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                style={{
                  backgroundColor: colors.bg,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                  borderRadius: 12,
                  color: colors.text,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 15,
                }}
              />

              {error ? (
                <Text style={{ color: colors.danger, fontSize: 12, marginTop: 10 }}>{error}</Text>
              ) : null}

              {/* Actions */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={!priceValid || saving}
                accessibilityRole="button"
                style={{
                  marginTop: 18,
                  backgroundColor: priceValid ? colors.accent : colors.cardBorder,
                  borderRadius: 12,
                  height: 46,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                }}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#04110b" />
                ) : (
                  <Text
                    style={{
                      color: priceValid ? '#04110b' : colors.textMuted,
                      fontWeight: '800',
                      fontSize: 13,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                    }}
                  >
                    {position ? 'Update Position' : 'Save Position'}
                  </Text>
                )}
              </TouchableOpacity>

              {position ? (
                <TouchableOpacity
                  onPress={handleClear}
                  disabled={saving}
                  accessibilityRole="button"
                  style={{
                    marginTop: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(244, 63, 94, 0.4)',
                    borderRadius: 12,
                    height: 42,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 12 }}>
                    Clear Position
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
