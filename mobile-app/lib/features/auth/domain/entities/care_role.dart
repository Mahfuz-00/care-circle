/// Care-circle roles, declared once (PRD §6, AGENTS.md rule 5).
///
/// API values are snake_case; [label] is display copy (never medical advice).
enum CareRole {
  self('self', 'Self'),
  senior('senior', 'Senior'),
  primaryCaregiver('primary_caregiver', 'Primary caregiver'),
  caregiver('caregiver', 'Caregiver'),
  unknown('unknown', 'Care circle member');

  const CareRole(this.apiValue, this.label);

  final String apiValue;
  final String label;

  static CareRole fromApi(Object? value) {
    if (value is! String) return CareRole.unknown;
    for (final CareRole role in values) {
      if (role.apiValue == value) return role;
    }
    return CareRole.unknown;
  }

  /// Roles a person may choose when creating their own account.
  static const List<CareRole> selectable = <CareRole>[self, senior, caregiver];
}
