
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/IconSymbol';
import { ThemeName, themeNames, themes } from '@/utils/themes';
import { CustomColors } from '@/types';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeName, customColors, setTheme, setCustomColors } = useAppTheme();
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [editingColors, setEditingColors] = useState<CustomColors>(
    customColors || themes['Soft Lavender'].colors
  );

  const handleThemeSelect = (newTheme: ThemeName) => {
    if (newTheme === 'Custom') {
      setShowCustomColorPicker(true);
    } else {
      setTheme(newTheme);
    }
  };

  const handleSaveCustomColors = () => {
    setCustomColors(editingColors);
    setTheme('Custom');
    setShowCustomColorPicker(false);
  };

  const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
    <View style={styles.colorInputContainer}>
      <Text style={[styles.colorLabel, { color: theme.colors.text }]}>{label}</Text>
      <View style={styles.colorInputRow}>
        <View style={[styles.colorPreviewBox, { backgroundColor: value }]} />
        <TextInput
          style={[styles.colorInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
          value={value}
          onChangeText={onChange}
          placeholder="#FFFFFF"
          placeholderTextColor={theme.colors.textSecondary}
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80' }}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.15 }}
    >
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={28}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Settings
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.mainSectionTitle, { color: theme.colors.text }]}>
            Choose Your Theme
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Select a calming color theme that feels right for you
          </Text>

          <View style={styles.themesGrid}>
            {themeNames.map((name, index) => {
              const isSelected = name === themeName;
              const themeColors = themes[name].colors;
              const isJewelTone = name.includes('Jewel');
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.themeCard,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                    isSelected && { borderColor: theme.colors.primary, borderWidth: 3 },
                  ]}
                  onPress={() => handleThemeSelect(name)}
                >
                  <View style={styles.themeHeader}>
                    <View style={styles.themeNameContainer}>
                      <Text style={[styles.themeName, { color: theme.colors.text }]}>
                        {name}
                      </Text>
                      {isJewelTone && (
                        <View style={[styles.jewelBadge, { backgroundColor: theme.colors.accent }]}>
                          <Text style={styles.jewelBadgeText}>💎</Text>
                        </View>
                      )}
                    </View>
                    {isSelected && (
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check-circle"
                        size={24}
                        color={theme.colors.primary}
                      />
                    )}
                  </View>
                  
                  <View style={styles.colorPreview}>
                    <View style={[styles.colorSwatch, { backgroundColor: themeColors.primary }]} />
                    <View style={[styles.colorSwatch, { backgroundColor: themeColors.secondary }]} />
                    <View style={[styles.colorSwatch, { backgroundColor: themeColors.accent }]} />
                  </View>

                  {name === 'Custom' && (
                    <TouchableOpacity
                      style={[styles.customizeButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => setShowCustomColorPicker(true)}
                    >
                      <IconSymbol
                        ios_icon_name="paintbrush.fill"
                        android_material_icon_name="palette"
                        size={16}
                        color="#FFFFFF"
                      />
                      <Text style={styles.customizeButtonText}>Customize</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.infoBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, marginTop: 24 }]}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              Your theme preference is saved locally on your device and will be remembered when you return. The calming background image adapts to your chosen theme.
            </Text>
          </View>
        </ScrollView>

        <Modal
          visible={showCustomColorPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCustomColorPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Customize Colors
                </Text>
                <TouchableOpacity onPress={() => setShowCustomColorPicker(false)}>
                  <IconSymbol
                    ios_icon_name="xmark.circle.fill"
                    android_material_icon_name="close"
                    size={28}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                <ColorInput
                  label="Background"
                  value={editingColors.background}
                  onChange={(value) => setEditingColors({ ...editingColors, background: value })}
                />
                <ColorInput
                  label="Card Background"
                  value={editingColors.card}
                  onChange={(value) => setEditingColors({ ...editingColors, card: value })}
                />
                <ColorInput
                  label="Primary Text"
                  value={editingColors.text}
                  onChange={(value) => setEditingColors({ ...editingColors, text: value })}
                />
                <ColorInput
                  label="Secondary Text"
                  value={editingColors.textSecondary}
                  onChange={(value) => setEditingColors({ ...editingColors, textSecondary: value })}
                />
                <ColorInput
                  label="Primary Color"
                  value={editingColors.primary}
                  onChange={(value) => setEditingColors({ ...editingColors, primary: value })}
                />
                <ColorInput
                  label="Secondary Color"
                  value={editingColors.secondary}
                  onChange={(value) => setEditingColors({ ...editingColors, secondary: value })}
                />
                <ColorInput
                  label="Accent Color"
                  value={editingColors.accent}
                  onChange={(value) => setEditingColors({ ...editingColors, accent: value })}
                />
                <ColorInput
                  label="Border Color"
                  value={editingColors.border}
                  onChange={(value) => setEditingColors({ ...editingColors, border: value })}
                />
                <ColorInput
                  label="Danger Color"
                  value={editingColors.danger}
                  onChange={(value) => setEditingColors({ ...editingColors, danger: value })}
                />
              </ScrollView>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveCustomColors}
              >
                <Text style={styles.saveButtonText}>Save Custom Theme</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  mainSectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  themesGrid: {
    gap: 16,
  },
  themeCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  themeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeName: {
    fontSize: 18,
    fontWeight: '600',
  },
  jewelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  jewelBadgeText: {
    fontSize: 12,
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 8,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  customizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  customizeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  modalScroll: {
    maxHeight: 400,
  },
  colorInputContainer: {
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  colorInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorPreviewBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  colorInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
