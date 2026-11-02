import 'package:care_circle_mobile/features/appointments/domain/entities/appointment.dart';
import 'package:care_circle_mobile/features/auth/domain/entities/auth_session.dart';
import 'package:care_circle_mobile/features/auth/domain/entities/care_circle.dart';
import 'package:care_circle_mobile/features/auth/domain/entities/care_role.dart';
import 'package:care_circle_mobile/features/auth/domain/entities/user.dart';
import 'package:care_circle_mobile/features/care_circle/domain/entities/care_circle_details.dart';
import 'package:care_circle_mobile/features/emergency/domain/entities/emergency_alert.dart';
import 'package:care_circle_mobile/features/home/domain/entities/today_summary.dart';
import 'package:care_circle_mobile/features/medications/domain/entities/dose.dart';
import 'package:care_circle_mobile/features/medications/domain/entities/medication.dart';
import 'package:care_circle_mobile/features/settings/domain/entities/accessibility_settings.dart';

/// Test fixtures. One place to build realistic `/mobile/v1` payload entities.
final DateTime kNow = DateTime(2026, 10, 14, 9);

CareCircle buildCareCircle({String id = 'cc-1', String name = 'The Bennett family'}) =>
    CareCircle(id: id, name: name);

User buildUser({
  String id = 'u-1',
  String name = 'Mary Bennett',
  String email = 'mary@example.com',
  CareRole role = CareRole.senior,
}) =>
    User(id: id, name: name, email: email, role: role, timezone: 'CET');

AuthSession buildAuthSession({
  User? user,
  String token = 'mobile-token',
  CareCircle? careCircle,
}) =>
    AuthSession(
      user: user ?? buildUser(),
      token: token,
      careCircle: careCircle,
    );

AuthAccount buildAuthAccount({
  User? user,
  List<CareCircle>? careCircles,
  CareCircle? activeCareCircle,
}) =>
    AuthAccount(
      user: user ?? buildUser(),
      careCircles: careCircles ?? <CareCircle>[buildCareCircle()],
      activeCareCircle: activeCareCircle ?? buildCareCircle(),
    );

DoseMedication buildDoseMedication({
  String id = 'med-1',
  String name = 'Metformin 500 mg',
  String dosage = '1 tablet',
}) =>
    DoseMedication(id: id, name: name, dosage: dosage);

Dose buildDose({
  String id = 'dose-1',
  DoseMedication? medication,
  DateTime? scheduledFor,
  DoseStatus status = DoseStatus.pending,
  DateTime? takenAt,
  String? skipReason,
}) =>
    Dose(
      id: id,
      medication: medication ?? buildDoseMedication(),
      scheduledFor: scheduledFor ?? DateTime(2026, 10, 14, 8),
      status: status,
      takenAt: takenAt,
      skipReason: skipReason,
    );

Medication buildMedication({
  String id = 'med-1',
  String name = 'Lisinopril 10 mg tablet, take one',
  String dosage = '1 tablet',
  String frequency = 'Once daily',
  List<String> times = const <String>['08:00'],
  bool withFood = false,
  int? daysRemaining = 30,
  bool isLowStock = false,
  String? pharmacyName,
  String? pharmacyPhone,
}) =>
    Medication(
      id: id,
      name: name,
      dosage: dosage,
      frequency: frequency,
      times: times,
      withFood: withFood,
      daysRemaining: daysRemaining,
      isLowStock: isLowStock,
      pharmacyName: pharmacyName,
      pharmacyPhone: pharmacyPhone,
    );

Appointment buildAppointment({
  String id = 'appt-1',
  String title = 'Dr Ahmed — check-up',
  String type = 'doctor',
  String location = 'Riverside Clinic, 2nd floor',
  DateTime? startsAt,
  String? notes,
}) =>
    Appointment(
      id: id,
      title: title,
      type: type,
      location: location,
      startsAt: startsAt ?? DateTime(2026, 10, 14, 11, 30),
      notes: notes,
    );

TodaySummary buildTodaySummary({
  List<Dose>? doses,
  List<Appointment>? appointments,
  CareCircle? careCircle,
  int unreadAlerts = 0,
}) =>
    TodaySummary(
      doses: doses ?? <Dose>[buildDose()],
      appointments: appointments ?? <Appointment>[],
      careCircle: careCircle ?? buildCareCircle(),
      unreadAlerts: unreadAlerts,
    );

EmergencyAlert buildEmergencyAlert({
  String id = 'alert-1',
  EmergencyType type = EmergencyType.medical,
  EmergencyStatus status = EmergencyStatus.open,
  EmergencyActor? acknowledgedBy,
  DateTime? createdAt,
}) =>
    EmergencyAlert(
      id: id,
      type: type,
      status: status,
      raisedBy: const EmergencyActor(id: 'u-1', name: 'Mary Bennett'),
      createdAt: createdAt ?? DateTime(2026, 10, 14, 9, 5),
      acknowledgedBy: acknowledgedBy,
      acknowledgedAt: acknowledgedBy == null ? null : DateTime(2026, 10, 14, 9, 7),
    );

CareCircleDetails buildCareCircleDetails({int members = 2}) => CareCircleDetails(
      id: 'cc-1',
      name: 'The Bennett family',
      members: <CareCircleMember>[
        const CareCircleMember(id: 'u-1', name: 'Mary Bennett', role: CareRole.senior),
        for (int i = 0; i < members - 1; i++)
          CareCircleMember(
            id: 'u-care-$i',
            name: 'Caregiver $i',
            role: CareRole.primaryCaregiver,
          ),
      ],
    );

AccessibilitySettings buildSettings({
  double? textScale,
  bool highContrast = false,
  bool announceActions = true,
}) =>
    AccessibilitySettings(
      textScaleOverride: textScale,
      highContrast: highContrast,
      announceActions: announceActions,
    );
