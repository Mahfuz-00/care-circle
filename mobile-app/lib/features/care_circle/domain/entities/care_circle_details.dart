import 'package:equatable/equatable.dart';

import '../../../auth/domain/entities/care_role.dart';

/// One member of a care circle (PRD §5.3 — the senior can always see this).
class CareCircleMember extends Equatable {
  const CareCircleMember({
    required this.id,
    required this.name,
    required this.role,
  });

  final String id;
  final String name;
  final CareRole role;

  @override
  List<Object?> get props => <Object?>[id, name, role];
}

/// A care circle with everyone who has access.
class CareCircleDetails extends Equatable {
  const CareCircleDetails({
    required this.id,
    required this.name,
    required this.members,
  });

  final String id;
  final String name;
  final List<CareCircleMember> members;

  @override
  List<Object?> get props => <Object?>[id, name, members];
}
