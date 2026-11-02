import 'package:care_circle_mobile/core/error/failure.dart';
import 'package:care_circle_mobile/core/error/result.dart';
import 'package:care_circle_mobile/core/router/app_router.dart';
import 'package:care_circle_mobile/core/theme/app_theme.dart';
import 'package:care_circle_mobile/core/widgets/accessible_button.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/has_session.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/load_account.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/login.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/logout.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/register.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/set_active_care_circle.dart';
import 'package:care_circle_mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:care_circle_mobile/features/auth/presentation/bloc/auth_event.dart';
import 'package:care_circle_mobile/features/emergency/domain/entities/emergency_alert.dart';
import 'package:care_circle_mobile/features/emergency/domain/usecases/acknowledge_emergency.dart';
import 'package:care_circle_mobile/features/emergency/domain/usecases/get_emergency_alert.dart';
import 'package:care_circle_mobile/features/emergency/domain/usecases/raise_emergency.dart';
import 'package:care_circle_mobile/features/emergency/presentation/bloc/emergency_bloc.dart';
import 'package:care_circle_mobile/features/emergency/presentation/widgets/emergency_help_button.dart';
import 'package:care_circle_mobile/features/home/domain/entities/today_summary.dart';
import 'package:care_circle_mobile/features/home/domain/usecases/get_today.dart';
import 'package:care_circle_mobile/features/home/presentation/bloc/today_bloc.dart';
import 'package:care_circle_mobile/features/home/presentation/screens/home_screen.dart';
import 'package:care_circle_mobile/features/medications/domain/usecases/skip_dose.dart';
import 'package:care_circle_mobile/features/medications/domain/usecases/snooze_dose.dart';
import 'package:care_circle_mobile/features/medications/domain/usecases/take_dose.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import '../../support/fakes.dart';
import '../../support/fixtures.dart';

/// Pumps a few frames without waiting for animations that never end (progress
/// indicators schedule frames forever, so pumpAndSettle would time out).
Future<void> settle(WidgetTester tester) async {
  for (int i = 0; i < 4; i++) {
    await tester.pump(const Duration(milliseconds: 60));
  }
}

/// Scrolls the Today list until [target] is built and on screen.
Future<void> scrollTo(WidgetTester tester, Finder target, {double delta = 120}) async {
  await tester.scrollUntilVisible(
    target,
    delta,
    scrollable: find.byType(Scrollable).first,
    maxScrolls: 40,
  );
  await settle(tester);
}

void main() {
  late FakeTodayRepository today;
  late FakeDoseRepository doses;
  late FakeEmergencyRepository emergency;
  late FakeAuthRepository auth;
  late TodayBloc todayBloc;

  setUp(() {
    today = FakeTodayRepository();
    doses = FakeDoseRepository();
    emergency = FakeEmergencyRepository();
    auth = FakeAuthRepository(hasSessionValue: true);
  });

  Future<void> pumpHome(
    WidgetTester tester, {
    RecordingAnnouncer? announcer,
  }) async {
    todayBloc = TodayBloc(
      getToday: GetToday(today),
      takeDose: TakeDose(doses),
      skipDose: SkipDose(doses),
      snoozeDose: SnoozeDose(doses),
    );
    final EmergencyBloc emergencyBloc = EmergencyBloc(
      raiseEmergency: RaiseEmergency(emergency),
      getEmergencyAlert: GetEmergencyAlert(emergency),
      acknowledgeEmergency: AcknowledgeEmergency(emergency),
    );
    final AuthBloc authBloc = AuthBloc(
      hasSession: HasSession(auth),
      login: Login(auth),
      register: Register(auth),
      loadAccount: LoadAccount(auth),
      logout: Logout(auth),
      setActiveCareCircle: SetActiveCareCircle(auth),
    )..add(const AuthStarted());

    final GoRouter router = GoRouter(
      initialLocation: '/',
      routes: <RouteBase>[
        GoRoute(
          path: '/',
          builder: (BuildContext context, GoRouterState state) =>
              HomeScreen(announcer: announcer),
        ),
        GoRoute(
          path: AppRoutes.emergency,
          builder: (BuildContext context, GoRouterState state) => const Scaffold(
            body: Center(child: Text('Emergency screen')),
          ),
        ),
      ],
    );

    await tester.pumpWidget(
      MultiBlocProvider(
        providers: <BlocProvider<dynamic>>[
          BlocProvider<AuthBloc>.value(value: authBloc),
          BlocProvider<TodayBloc>.value(value: todayBloc),
          BlocProvider<EmergencyBloc>.value(value: emergencyBloc),
        ],
        child: MaterialApp.router(theme: AppTheme.light(), routerConfig: router),
      ),
    );
    await settle(tester);
  }

  group('HomeScreen', () {
    testWidgets('always shows the emergency button, and one press raises one alert',
        (WidgetTester tester) async {
      await pumpHome(tester);

      expect(find.byType(EmergencyHelpButton), findsOneWidget);
      expect(
        tester.getSize(find.byType(EmergencyHelpButton)).height,
        greaterThanOrEqualTo(64),
      );

      await tester.tap(find.byType(EmergencyHelpButton));
      await settle(tester);

      expect(emergency.raiseCalls, <EmergencyType>[EmergencyType.medical]);
      expect(find.text('Emergency screen'), findsOneWidget);
    });

    testWidgets('a dose can be marked taken with one tap from Today',
        (WidgetTester tester) async {
      await pumpHome(tester);

      final Finder takeButton = find.widgetWithText(AccessibleButton, 'I took it');
      await scrollTo(tester, takeButton);
      await tester.tap(takeButton);
      await settle(tester);

      expect(doses.takeCalls, <String>['dose-1']);
      expect(todayBloc.state.message, 'Dose marked as taken.');
      expect(todayBloc.state.busyDoseIds, isEmpty);
    });

    testWidgets('reads today’s plan out loud (voice-first path)',
        (WidgetTester tester) async {
      final RecordingAnnouncer announcer = RecordingAnnouncer();
      await pumpHome(tester, announcer: announcer);

      final Finder hearIt = find.widgetWithText(AccessibleButton, 'Hear today’s plan');
      await scrollTo(tester, hearIt);
      await tester.tap(hearIt);
      await settle(tester);

      expect(
        announcer.messages.any((String message) => message.contains('You have 1 dose today')),
        isTrue,
      );
      expect(
        announcer.messages.any((String message) => message.contains('Metformin 500 mg')),
        isTrue,
      );
    });

    testWidgets('a failed load offers a big try-again button',
        (WidgetTester tester) async {
      today.result = const Err<TodaySummary>(NetworkFailure('offline'));
      await pumpHome(tester);

      expect(find.text('offline'), findsOneWidget);
      expect(find.widgetWithText(AccessibleButton, 'Try again'), findsOneWidget);

      today.result = null;
      await tester.tap(find.widgetWithText(AccessibleButton, 'Try again'));
      await settle(tester);

      expect(find.text('Medicines due today'), findsOneWidget);
    });

    testWidgets('tells the senior who has access and how many updates are waiting',
        (WidgetTester tester) async {
      today.result = Ok<TodaySummary>(buildTodaySummary(unreadAlerts: 2));
      await pumpHome(tester);

      expect(find.textContaining('2 new updates'), findsOneWidget);

      final Finder careCircleTile = find.text('My care circle');
      await scrollTo(tester, careCircleTile);

      expect(careCircleTile, findsOneWidget);
    });
  });
}
