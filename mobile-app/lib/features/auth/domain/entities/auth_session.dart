import 'package:equatable/equatable.dart';

import 'care_circle.dart';
import 'care_role.dart';
import 'user.dart';

/// What a successful register/login returns.
class AuthSession extends Equatable {
  const AuthSession({
    required this.user,
    required this.token,
    this.careCircle,
  });

  final User user;

  /// Sanctum token minted on the `/mobile/v1` surface.
  final String token;

  /// Present on register; on login it is filled by [AuthAccount].
  final CareCircle? careCircle;

  @override
  List<Object?> get props => <Object?>[user, token, careCircle];
}

/// `GET /mobile/v1/auth/me`.
class AuthAccount extends Equatable {
  const AuthAccount({
    required this.user,
    required this.careCircles,
    this.activeCareCircle,
  });

  final User user;
  final List<CareCircle> careCircles;
  final CareCircle? activeCareCircle;

  @override
  List<Object?> get props => <Object?>[user, careCircles, activeCareCircle];
}

/// Input for account creation (PRD §5.3).
class RegisterRequest extends Equatable {
  const RegisterRequest({
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
