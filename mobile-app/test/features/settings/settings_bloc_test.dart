import 'package:care_circle_mobile/features/settings/domain/usecases/load_accessibility_settings.dart';
import 'package:care_circle_mobile/features/settings/domain/usecases/save_accessibility_settings.dart';
import 'package:care_circle_mobile/features/settings/presentation/bloc/settings_bloc.dart';
import 'package:care_circle_mobile/features/settings/presentation/bloc/settings_event.dart';
import 'package:care_circle_mobile/features/settings/presentation/bloc/settings_state.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/fakes.dart';
import '../../support/fixtures.dart';

void main() {
  late FakeSettingsRepository repository;

  SettingsBloc build() => SettingsBloc(
        loadSettings: LoadAccessibilitySettings(repository),
        saveSettings: SaveAccessibilitySettings(repository),
      );

  setUp(() => repository = FakeSettingsRepository());

  group('SettingsBloc', () {
    test('starts by following the device text size', () async {
      final SettingsBloc bloc = build();

      bloc.add(const SettingsRequested());
      await bloc.stream.firstWhere((SettingsState state) => state.loaded);

      expect(bloc.state.settings.followsDeviceTextScale, isTrue);
      expect(bloc.state.highContrast, isFalse);
      expect(bloc.state.announceActions, isTrue);
    });

    test('a stored preference is loaded', () async {
      repository.initial = buildSettings(textScale: 1.6, highContrast: true);
      final SettingsBloc bloc = build();

      bloc.add(const SettingsRequested());
      await bloc.stream.firstWhere((SettingsState state) => state.loaded);

      expect(bloc.state.textScaleOverride, 1.6);
      expect(bloc.state.highContrast, isTrue);
    });

    test('changing the text size applies immediately and persists', () async {
      final SettingsBloc bloc = build();

      bloc.add(const SettingsTextScaleChanged(2));
      await bloc.stream.firstWhere((SettingsState state) => state.textScaleOverride == 2);

      expect(bloc.state.settings.followsDeviceTextScale, isFalse);
      expect(repository.written?.textScaleOverride, 2);
    });

    test('going back to the device size clears the override', () async {
      repository.initial = buildSettings(textScale: 1.3);
      final SettingsBloc bloc = build();

      bloc.add(const SettingsRequested());
      await bloc.stream.firstWhere((SettingsState state) => state.loaded);

      bloc.add(const SettingsTextScaleChanged(null));
      await bloc.stream.firstWhere(
        (SettingsState state) => state.settings.followsDeviceTextScale,
      );

      expect(repository.written?.textScaleOverride, isNull);
    });

    test('high contrast and spoken confirmations can be switched on and off',
        () async {
      final SettingsBloc bloc = build();

      bloc.add(const SettingsHighContrastToggled(true));
      await bloc.stream.firstWhere((SettingsState state) => state.highContrast);
      expect(repository.written?.highContrast, isTrue);

      bloc.add(const SettingsAnnounceActionsToggled(false));
      await bloc.stream.firstWhere((SettingsState state) => !state.announceActions);
      expect(repository.written?.announceActions, isFalse);
    });
  });
}
