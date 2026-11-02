import 'package:equatable/equatable.dart';

import 'care_role.dart';

/// A person using CareCircle.
class User extends Equatable {
  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.timezone,
  });

  final String id;
  final String name;
  final String email;
  final CareRole role;

  /// IANA-ish timezone name reported to the API (see README for the
  /// limitation: Dart only exposes the short OS name).
  final String? timezone;

  /// First word of the name, used for the warm greeting on Today.
  String get greetingName {
    final String trimmed = name.trim();
    if (trimmed.isEmpty) return 'there';
    final int space = trimmed.indexOf(' ');
    return space > 0 ? trimmed.substring(0, space) : trimmed;
  }

  @override
  List<Object?> get props => <Object?>[id, name, email, role, timezone];
}
