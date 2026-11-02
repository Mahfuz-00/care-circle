import 'package:care_circle_mobile/core/error/failure.dart';
import 'package:care_circle_mobile/core/error/result.dart';
import 'package:care_circle_mobile/core/theme/app_theme.dart';
import 'package:care_circle_mobile/core/widgets/accessible_button.dart';
import 'package:care_circle_mobile/core/widgets/accessible_text_field.dart';
import 'package:care_circle_mobile/features/auth/domain/entities/auth_session.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/has_session.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/load_account.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/login.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/logout.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/register.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/set_active_care_circle.dart';
import 'package:care_circle_mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:care_circle_mobile/features/auth/presentation/screens/login_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/fakes.dart';

Future<void> settle(WidgetTester tester) async {
  for (int i = 0; i < 4; i++) {
    await tester.pump(const Duration(milliseconds: 60));
  }
}

void main() {
  late FakeAuthRepository auth;

  setUp(() => auth = FakeAuthRepository());

  Future<void> pumpLogin(
    WidgetTester tester, {
    RecordingAnnouncer? announcer,
    double textScale = 1,
  }) async {
    final AuthBloc bloc = AuthBloc(
      hasSession: HasSession(auth),
      login: Login(auth),
      register: Register(auth),
      loadAccount: LoadAccount(auth),
      logout: Logout(auth),
      setActiveCareCircle: SetActiveCareCircle(auth),
    );

    await tester.pumpWidget(
      BlocProvider<AuthBloc>.value(
        value: bloc,
        child: MaterialApp(
          theme: AppTheme.light(),
          home: MediaQuery(
            data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
            child: LoginScreen(announcer: announcer),
          ),
        ),
      ),
    );
    await tester.pump();
  }

  group('LoginScreen', () {
    testWidgets('never submits an empty form and explains why',
        (WidgetTester tester) async {
      final RecordingAnnouncer announcer = RecordingAnnouncer();
      await pumpLogin(tester, announcer: announcer);

      await tester.tap(find.widgetWithText(AccessibleButton, 'Sign in'));
      await settle(tester);

      expect(auth.loginCalls, 0);
      expect(find.text('Enter your email address.'), findsOneWidget);
      expect(find.text('Enter your password.'), findsOneWidget);
      expect(
        announcer.messages,
        contains('Please check your email and password, then try again.'),
      );
    });

    testWidgets('sends valid credentials to the API', (WidgetTester tester) async {
      await pumpLogin(tester);

      await tester.enterText(find.byType(TextFormField).at(0), 'mary@example.com');
      await tester.enterText(find.byType(TextFormField).at(1), 'secret123');
      await tester.pump();
      await tester.tap(find.widgetWithText(AccessibleButton, 'Sign in'));
      await settle(tester);

      expect(auth.loginCalls, 1);
      expect(auth.lastEmail, 'mary@example.com');
    });

    testWidgets('shows the reason a sign in was rejected',
        (WidgetTester tester) async {
      auth.loginResult = const Err<AuthSession>(
        ValidationFailure('We do not know that email or password.'),
      );
      await pumpLogin(tester);

      await tester.enterText(find.byType(TextFormField).at(0), 'nobody@example.com');
      await tester.enterText(find.byType(TextFormField).at(1), 'secret123');
      await tester.pump();
      await tester.tap(find.widgetWithText(AccessibleButton, 'Sign in'));
      await settle(tester);

      expect(find.text('We do not know that email or password.'), findsOneWidget);
      expect(find.widgetWithText(AccessibleButton, 'Create an account'), findsOneWidget);
    });

    testWidgets('labels its fields for screen readers and offers big controls',
        (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      await pumpLogin(tester, textScale: 2);

      expect(find.byType(AccessibleTextField), findsNWidgets(2));
      expect(
        tester.getSize(find.widgetWithText(AccessibleButton, 'Sign in')).height,
        greaterThanOrEqualTo(48),
      );
      expect(tester.takeException(), isNull);

      handle.dispose();
    });

    testWidgets('states plainly that CareCircle gives no medical advice',
        (WidgetTester tester) async {
      await pumpLogin(tester);

      expect(find.textContaining('does not give medical advice'), findsOneWidget);
    });
  });
}
