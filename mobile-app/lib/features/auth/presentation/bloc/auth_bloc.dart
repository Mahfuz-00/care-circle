import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/failure.dart';
import '../../../../core/error/result.dart';
import '../../domain/entities/auth_session.dart';
import '../../domain/entities/care_circle.dart';
import '../../domain/usecases/has_session.dart';
import '../../domain/usecases/load_account.dart';
import '../../domain/usecases/login.dart';
import '../../domain/usecases/logout.dart';
import '../../domain/usecases/register.dart';
import '../../domain/usecases/set_active_care_circle.dart';
import 'auth_event.dart';
import 'auth_state.dart';

/// Owns the session: who is signed in and which care circle is active.
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc({
    required HasSession hasSession,
    required Login login,
    required Register register,
    required LoadAccount loadAccount,
    required Logout logout,
    required SetActiveCareCircle setActiveCareCircle,
  })  : _hasSession = hasSession,
        _login = login,
        _register = register,
        _loadAccount = loadAccount,
        _logout = logout,
        _setActiveCareCircle = setActiveCareCircle,
        super(const AuthState()) {
    on<AuthStarted>(_onStarted);
    on<AuthLoginRequested>(_onLoginRequested);
    on<AuthRegisterRequested>(_onRegisterRequested);
    on<AuthLogoutRequested>(_onLogoutRequested);
    on<AuthCareCircleSelected>(_onCareCircleSelected);
    on<AuthMessageCleared>(_onMessageCleared);
  }

  final HasSession _hasSession;
  final Login _login;
  final Register _register;
  final LoadAccount _loadAccount;
  final Logout _logout;
  final SetActiveCareCircle _setActiveCareCircle;

  Future<void> _onStarted(AuthStarted event, Emitter<AuthState> emit) async {
    final bool hasToken = await _hasSession();
    if (!hasToken) {
      emit(const AuthState(status: AuthStatus.unauthenticated));
      return;
    }

    final Result<AuthAccount> account = await _loadAccount();
    switch (account) {
      case Ok<AuthAccount>(value: final AuthAccount value):
        emit(
          AuthState(
            status: AuthStatus.authenticated,
            user: value.user,
            careCircles: value.careCircles,
            activeCareCircle: value.activeCareCircle ?? _firstOrNull(value.careCircles),
          ),
        );
      case Err<AuthAccount>(failure: final Failure failure):
        if (failure is UnauthorizedFailure) {
          await _logout();
        }
        emit(AuthState(status: AuthStatus.unauthenticated, message: failure.message));
    }
  }

  Future<void> _onLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(
      state.copyWith(
        status: AuthStatus.authenticating,
        message: null,
        fieldErrors: const <String, String>{},
      ),
    );

    final Result<AuthSession> result =
        await _login(email: event.email, password: event.password);

    switch (result) {
      case Ok<AuthSession>(value: final AuthSession session):
        emit(await _authenticated(session));
      case Err<AuthSession>(failure: final Failure failure):
        emit(_failedState(failure));
    }
  }

  Future<void> _onRegisterRequested(
    AuthRegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(
      state.copyWith(
        status: AuthStatus.authenticating,
        message: null,
        fieldErrors: const <String, String>{},
      ),
    );

    final Result<AuthSession> result = await _register(
      RegisterRequest(
        name: event.name,
        email: event.email,
        password: event.password,
        role: event.role,
        timezone: event.timezone,
      ),
    );

    switch (result) {
      case Ok<AuthSession>(value: final AuthSession session):
        emit(await _authenticated(session));
      case Err<AuthSession>(failure: final Failure failure):
        emit(_failedState(failure));
    }
  }

  Future<void> _onLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await _logout();
    emit(const AuthState(status: AuthStatus.unauthenticated));
  }

  Future<void> _onCareCircleSelected(
    AuthCareCircleSelected event,
    Emitter<AuthState> emit,
  ) async {
    final Result<void> result = await _setActiveCareCircle(event.careCircleId);
    final Failure? failure = result.failureOrNull;
    if (failure != null) {
      emit(state.copyWith(message: failure.message));
      return;
    }
    final CareCircle? selected = _findById(state.careCircles, event.careCircleId);
    emit(state.copyWith(activeCareCircle: selected, message: null));
  }

  void _onMessageCleared(AuthMessageCleared event, Emitter<AuthState> emit) {
    if (state.message == null) return;
    emit(state.copyWith(message: null));
  }

  AuthState _failedState(Failure failure) => AuthState(
        status: AuthStatus.unauthenticated,
        message: failure.message,
        fieldErrors: failure is ValidationFailure
            ? failure.fieldErrors
            : const <String, String>{},
      );

  /// Signs in fully: the session, then the care circles it can see.
  Future<AuthState> _authenticated(AuthSession session) async {
    final Result<AuthAccount> account = await _loadAccount();
    switch (account) {
      case Ok<AuthAccount>(value: final AuthAccount value):
        return AuthState(
          status: AuthStatus.authenticated,
          user: value.user,
          careCircles: value.careCircles,
          activeCareCircle:
              value.activeCareCircle ?? session.careCircle ?? _firstOrNull(value.careCircles),
        );
      case Err<AuthAccount>():
        // The token works but `/auth/me` failed: stay signed in with what we
        // already know and let the Today screen surface the problem.
        return AuthState(
          status: AuthStatus.authenticated,
          user: session.user,
          activeCareCircle: session.careCircle,
        );
    }
  }

  CareCircle? _firstOrNull(List<CareCircle> circles) =>
      circles.isEmpty ? null : circles.first;

  CareCircle? _findById(List<CareCircle> circles, String id) {
    for (final CareCircle circle in circles) {
      if (circle.id == id) return circle;
    }
    return null;
  }
}
