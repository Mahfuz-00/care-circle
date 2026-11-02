import 'package:equatable/equatable.dart';

import '../../domain/entities/care_circle.dart';
import '../../domain/entities/user.dart';

const Object _unset = Object();

/// Where the app is in the sign-in journey.
enum AuthStatus {
  /// Checking the stored token; the router shows the splash screen.
  unknown,
  unauthenticated,
  authenticating,
  authenticated,
}

class AuthState extends Equatable {
  const AuthState({
    this.status = AuthStatus.unknown,
    this.user,
    this.careCircles = const <CareCircle>[],
    this.activeCareCircle,
    this.message,
    this.fieldErrors = const <String, String>{},
  });

  final AuthStatus status;
  final User? user;
  final List<CareCircle> careCircles;
  final CareCircle? activeCareCircle;

  /// Message to announce/show (sign-in problems, session expiry).
  final String? message;

  /// Field level errors from the API (422 responses).
  final Map<String, String> fieldErrors;

  bool get isAuthenticated => status == AuthStatus.authenticated;

  bool get isBusy => status == AuthStatus.authenticating;

  AuthState copyWith({
    AuthStatus? status,
    Object? user = _unset,
    List<CareCircle>? careCircles,
    Object? activeCareCircle = _unset,
    Object? message = _unset,
    Map<String, String>? fieldErrors,
  }) =>
      AuthState(
        status: status ?? this.status,
        user: identical(user, _unset) ? this.user : user as User?,
        careCircles: careCircles ?? this.careCircles,
        activeCareCircle: identical(activeCareCircle, _unset)
            ? this.activeCareCircle
            : activeCareCircle as CareCircle?,
        message: identical(message, _unset) ? this.message : message as String?,
        fieldErrors: fieldErrors ?? this.fieldErrors,
      );

  @override
  List<Object?> get props => <Object?>[
        status,
        user,
        careCircles,
        activeCareCircle,
        message,
        fieldErrors,
      ];
}
