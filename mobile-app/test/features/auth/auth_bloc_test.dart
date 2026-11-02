import 'package:bloc_test/bloc_test.dart';
import 'package:care_circle_mobile/core/error/failure.dart';
import 'package:care_circle_mobile/core/error/result.dart';
import 'package:care_circle_mobile/features/auth/domain/entities/auth_session.dart';
import 'package:care_circle_mobile/features/auth/domain/entities/care_role.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/has_session.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/load_account.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/login.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/logout.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/register.dart';
import 'package:care_circle_mobile/features/auth/domain/usecases/set_active_care_circle.dart';
import 'package:care_circle_mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:care_circle_mobile/features/auth/presentation/bloc/auth_event.dart';
import 'package:care_circle_mobile/features/auth/presentation/bloc/auth_state.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/fakes.dart';

AuthBloc buildBloc(FakeAuthRepository repository) => AuthBloc(
      hasSession: HasSession(repository),
      login: Login(repository),
      register: Register(repository),
      loadAccount: LoadAccount(repository),
      logout: Logout(repository),
      setActiveCareCircle: SetActiveCareCircle(repository),
    );

void main() {
  group('AuthBloc', () {
    blocTest<AuthBloc, AuthState>(
      'starting without a stored session lands on the sign-in screen',
      build: () => buildBloc(FakeAuthRepository()),
      act: (AuthBloc bloc) => bloc.add(const AuthStarted()),
      expect: () => <Matcher>[
        isA<AuthState>().having((AuthState s) => s.status, 'status', AuthStatus.unauthenticated),
      ],
    );

    blocTest<AuthBloc, AuthState>(
      'a stored session is restored with its care circle',
      build: () => buildBloc(FakeAuthRepository(hasSessionValue: true)),
      act: (AuthBloc bloc) => bloc.add(const AuthStarted()),
      expect: () => <Matcher>[
        isA<AuthState>()
            .having((AuthState s) => s.status, 'status', AuthStatus.authenticated)
            .having((AuthState s) => s.user?.name, 'user', 'Mary Bennett')
            .having((AuthState s) => s.activeCareCircle?.id, 'circle', 'cc-1'),
      ],
    );

    blocTest<AuthBloc, AuthState>(
      'an expired token clears the session and asks for sign in',
      build: () => buildBloc(
        FakeAuthRepository(
          hasSessionValue: true,
          accountResult: const Err<AuthAccount>(
            UnauthorizedFailure('Your session has ended.'),
          ),
        ),
      ),
      act: (AuthBloc bloc) => bloc.add(const AuthStarted()),
      expect: () => <Matcher>[
        isA<AuthState>()
            .having((AuthState s) => s.status, 'status', AuthStatus.unauthenticated)
            .having((AuthState s) => s.message, 'message', 'Your session has ended.'),
      ],
    );

    blocTest<AuthBloc, AuthState>(
      'signing in emits authenticating then authenticated',
      build: () => buildBloc(FakeAuthRepository()),
      act: (AuthBloc bloc) => bloc.add(
        const AuthLoginRequested(email: 'mary@example.com', password: 'secret123'),
      ),
      expect: () => <Matcher>[
        isA<AuthState>().having((AuthState s) => s.status, 'status', AuthStatus.authenticating),
        isA<AuthState>()
            .having((AuthState s) => s.status, 'status', AuthStatus.authenticated)
            .having((AuthState s) => s.user?.email, 'email', 'mary@example.com'),
      ],
    );

    blocTest<AuthBloc, AuthState>(
      'a rejected sign in reports why and stays signed out',
      build: () => buildBloc(
        FakeAuthRepository(
          loginResult: const Err<AuthSession>(
            ValidationFailure(
              'Please check the highlighted fields.',
              fieldErrors: <String, String>{'email': 'We do not know that email.'},
            ),
          ),
        ),
      ),
      act: (AuthBloc bloc) => bloc.add(
        const AuthLoginRequested(email: 'nobody@example.com', password: 'secret123'),
      ),
      expect: () => <Matcher>[
        isA<AuthState>().having((AuthState s) => s.status, 'status', AuthStatus.authenticating),
        isA<AuthState>()
            .having((AuthState s) => s.status, 'status', AuthStatus.unauthenticated)
            .having(
              (AuthState s) => s.fieldErrors['email'],
              'field error',
              'We do not know that email.',
            ),
      ],
    );

    final FakeAuthRepository registerRepository = FakeAuthRepository();

    blocTest<AuthBloc, AuthState>(
      'registering carries the chosen role to the API',
      build: () => buildBloc(registerRepository),
      act: (AuthBloc bloc) => bloc.add(
        const AuthRegisterRequested(
          name: 'Mary Bennett',
          email: 'mary@example.com',
          password: 'secret123',
          role: CareRole.senior,
          timezone: 'CET',
        ),
      ),
      skip: 1,
      expect: () => <Matcher>[
        isA<AuthState>().having((AuthState s) => s.status, 'status', AuthStatus.authenticated),
      ],
      verify: (_) {
        expect(registerRepository.registerCalls, 1);
        expect(registerRepository.lastRegisterRequest?.role, CareRole.senior);
        expect(registerRepository.lastRegisterRequest?.timezone, 'CET');
      },
    );

    test('signing out always ends the device session', () async {
      final FakeAuthRepository repository = FakeAuthRepository(hasSessionValue: true);
      final AuthBloc bloc = buildBloc(repository);

      bloc.add(const AuthLogoutRequested());
      await bloc.stream.firstWhere(
        (AuthState state) => state.status == AuthStatus.unauthenticated,
      );

      expect(repository.logoutCalls, 1);
      expect(bloc.state.user, isNull);
    });
  });
}
