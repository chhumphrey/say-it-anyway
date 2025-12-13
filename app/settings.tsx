
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/IconSymbol';
import { ThemeName, themeNames, themes } from '@/utils/themes';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeName, setTheme } = useAppTheme();

  const handleThemeSelect = (newTheme: ThemeName) => {
    setTheme(newTheme);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
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
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Choose Your Theme
        </Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          Select a calming color theme that feels right for you
        </Text>

        <View style={styles.themesGrid}>
          {themeNames.map((name) => {
            const isSelected = name === themeName;
            const themeColors = themes[name].colors;
            return (
              <TouchableOpacity
                key={name}
                style={[
                  styles.themeCard,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                  isSelected && { borderColor: theme.colors.primary, borderWidth: 3 },
                ]}
                onPress={() => handleThemeSelect(name)}
              >
                <View style={styles.themeHeader}>
                  <Text style={[styles.themeName, { color: theme.colors.text }]}>
                    {name}
                  </Text>
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
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.infoBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Your theme preference is saved locally on your device and will be remembered when you return.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
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
  themeName: {
    fontSize: 18,
    fontWeight: '600',
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
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
