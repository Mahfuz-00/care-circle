import 'package:equatable/equatable.dart';

import '../../domain/entities/care_role.dart';

/// Events for the authentication flow.
sealed class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => const <Object?>[];
}

/// Restore the session stored on this device (app start).
final class AuthStarted extends AuthEvent {
  const AuthStarted();
}

/// Sign in with email + password.
final class AuthLoginRequested extends AuthEvent {
  const AuthLoginRequested({required this.email, required this.password});

  final String email;
  final String password;

  @override
  List<Object?> get props => <Object?>[email, password];
}

/// Create an account and its first care circle.
final class AuthRegisterRequested extends AuthEvent {
  const AuthRegisterRequested({
    required this.name,
    required this.email,
    required this.password,
    required this.role,
    required this.timezone,
  });

  final String name;
  final String email;
  final String password;
  final CareRole role;
  final String timezone;

  @override
  List<Object?> get props => <Object?>[name, email, password, role, timezone];
}

/// Sign out on this device.
final class AuthLogoutRequested extends AuthEvent {
  const AuthLogoutRequested();
}

/// Switch the care circle being shown.
final class AuthCareCircleSelected extends AuthEvent {
  const AuthCareCircleSelected(this.careCircleId);

  final String careCircleId;

  @override
  List<Object?> get props => <Object?>[careCircleId];
}

/// Dismiss the current message.
final class AuthMessageCleared extends AuthEvent {
  const AuthMessageCleared();
}
