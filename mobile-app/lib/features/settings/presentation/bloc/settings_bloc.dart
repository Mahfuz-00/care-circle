import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/accessibility_settings.dart';
import '../../domain/usecases/load_accessibility_settings.dart';
import '../../domain/usecases/save_accessibility_settings.dart';
import 'settings_event.dart';
import 'settings_state.dart';

/// Accessibility preferences (PRD §9): text size, contrast, announcements.
///
/// The state is applied by the root widget, so changing it re-renders the whole
/// app immediately — no restart, no lost screen.
class SettingsBloc extends Bloc<SettingsEvent, SettingsState> {
  SettingsBloc({
    required LoadAccessibilitySettings loadSettings,
    required SaveAccessibilitySettings saveSettings,
  })  : _loadSettings = loadSettings,
        _saveSettings = saveSettings,
        super(const SettingsState()) {
    on<SettingsRequested>(_onRequested);
    on<SettingsTextScaleChanged>(_onTextScaleChanged);
    on<SettingsHighContrastToggled>(_onHighContrastToggled);
    on<SettingsAnnounceActionsToggled>(_onAnnounceActionsToggled);
  }

  final LoadAccessibilitySettings _loadSettings;
  final SaveAccessibilitySettings _saveSettings;

  void _onRequested(SettingsRequested event, Emitter<SettingsState> emit) {
    emit(state.copyWith(settings: _loadSettings(), loaded: true));
  }

  Future<void> _onTextScaleChanged(
    SettingsTextScaleChanged event,
    Emitter<SettingsState> emit,
  ) =>
      _apply(emit, state.settings.copyWith(textScaleOverride: event.textScale));

  Future<void> _onHighContrastToggled(
    SettingsHighContrastToggled event,
    Emitter<SettingsState> emit,
  ) =>
      _apply(emit, state.settings.copyWith(highContrast: event.enabled));

  Future<void> _onAnnounceActionsToggled(
    SettingsAnnounceActionsToggled event,
    Emitter<SettingsState> emit,
  ) =>
      _apply(emit, state.settings.copyWith(announceActions: event.enabled));

  /// Emits first (so the UI reacts instantly), then persists.
  Future<void> _apply(
    Emitter<SettingsState> emit,
    AccessibilitySettings settings,
  ) async {
    emit(state.copyWith(settings: settings, loaded: true));
    await _saveSettings(settings);
  }
}
