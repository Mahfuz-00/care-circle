import 'package:care_circle_mobile/core/theme/app_theme.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/has_session.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/load_account.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/login.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/logout.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/register.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/set_active_care_circle.dart';
import 'package:care_circle_mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:care_circle_mobile/features/auth/presentation/bloc/auth_event.dart';
import 'package:care_circle_mobile/features/settings/domain/usecases/load_accessibility_settings.dart';
import 'package:care_circle_mobile/features/settings/domain/usecases/save_accessibility_settings.dart';
import 'package:care_circle_mobile/features/settings/presentation/bloc/settings_bloc.dart';
import 'package:care_circle_mobile/features/settings/presentation/bloc/settings_event.dart';
import 'package:care_circle_mobile/features/settings/presentation/screens/settings_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/fakes.dart';

Future<void> settle(WidgetTester tester) async {
  for (int i = 0; i < 4; i++) {
    await tester.pump(const Duration(milliseconds: 60));
  }
}

Future<void> scrollTo(WidgetTester tester, Finder target) async {
  await tester.scrollUntilVisible(
    target,
    120,
    scrollable: find.byType(Scrollable).first,
    maxScrolls: 40,
  );
  await settle(tester);
}

void main() {
  late FakeSettingsRepository settings;
  late FakeAuthRepository auth;
  late SettingsBloc settingsBloc;

  setUp(() {
    settings = FakeSettingsRepository();
    auth = FakeAuthRepository(hasSessionValue: true);
    settingsBloc = SettingsBloc(
      loadSettings: LoadAccessibilitySettings(settings),
      saveSettings: SaveAccessibilitySettings(settings),
    )..add(const SettingsRequested());
  });

  Future<void> pumpScreen(WidgetTester tester) async {
    final AuthBloc authBloc = AuthBloc(
      hasSession: HasSession(auth),
      login: Login(auth),
      register: Register(auth),
      loadAccount: LoadAccount(auth),
      logout: Logout(auth),
      setActiveCareCircle: SetActiveCareCircle(auth),
    )..add(const AuthStarted());

    await tester.pumpWidget(
      MultiBlocProvider(
        providers: <BlocProvider<dynamic>>[
          BlocProvider<SettingsBloc>.value(value: settingsBloc),
          BlocProvider<AuthBloc>.value(value: authBloc),
        ],
        child: MaterialApp(theme: AppTheme.light(), home: const SettingsScreen()),
      ),
    );
    await settle(tester);
  }

  group('SettingsScreen', () {
    testWidgets('offers the device size by default and applies a bigger one',
        (WidgetTester tester) async {
      await pumpScreen(tester);

      expect(find.text('Follow my phone'), findsOneWidget);

      final Finder largest = find.text('Largest');
      await scrollTo(tester, largest);
      await tester.tap(largest);
      await settle(tester);

      expect(settingsBloc.state.textScaleOverride, 2);
      expect(settings.written?.textScaleOverride, 2);
    });

    testWidgets('higher contrast can be switched on and is saved',
        (WidgetTester tester) async {
      await pumpScreen(tester);

      final Finder highContrast = find.text('Higher contrast colours');
      await scrollTo(tester, highContrast);
      await tester.tap(find.byType(Switch).first);
      await settle(tester);

      expect(settingsBloc.state.highContrast, isTrue);
      expect(settings.written?.highContrast, isTrue);
    });

    testWidgets('spoken confirmations can be switched off',
        (WidgetTester tester) async {
      await pumpScreen(tester);

      final Finder announce = find.text('Speak confirmations');
      await scrollTo(tester, announce);
      await tester.tap(find.byType(Switch).last);
      await settle(tester);

      expect(settingsBloc.state.announceActions, isFalse);
      expect(settings.written?.announceActions, isFalse);
    });

    testWidgets('reminds the person that CareCircle gives no medical advice',
        (WidgetTester tester) async {
      await pumpScreen(tester);

      final Finder note = find.textContaining('never gives');
      await scrollTo(tester, note);

      expect(note, findsOneWidget);
    });
  });
}
