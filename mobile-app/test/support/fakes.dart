import 'package:care_circle_mobile/core/accessibility/announcer.dart';
import 'package:care_circle_mobile/core/actions/phone_actions.dart';
import 'package:care_circle_mobile/core/error/failure.dart';
import 'package:care_circle_mobile/core/error/result.dart';
import 'package:care_circle_mobile/core/storage/session_store.dart';
import 'package:care_circle_mobile/features/appointments/domain/entities/appointment.dart';
import 'package:care_circle_mobile/features/appointments/domain/repositories/appointment_repository.dart';
import 'package:care_circle_mobile/features/auth/domain/entities/auth_session.dart';
import 'package:care_circle_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:care_circle_mobile/features/care_circle/domain/entities/care_circle_details.dart';
import 'package:care_circle_mobile/features/care_circle/domain/repositories/care_circle_repository.dart';
import 'package:care_circle_mobile/features/emergency/domain/entities/emergency_alert.dart';
import 'package:care_circle_mobile/features/emergency/domain/repositories/emergency_repository.dart';
import 'package:care_circle_mobile/features/home/domain/entities/today_summary.dart';
import 'package:care_circle_mobile/features/home/domain/repositories/today_repository.dart';
import 'package:care_circle_mobile/features/medications/domain/entities/medication.dart';
import 'package:care_circle_mobile/features/medications/domain/repositories/dose_repository.dart';
import 'package:care_circle_mobile/features/medications/domain/repositories/medication_repository.dart';
import 'package:care_circle_mobile/features/settings/domain/entities/accessibility_settings.dart';
import 'package:care_circle_mobile/features/settings/domain/repositories/settings_repository.dart';
import 'package:flutter/widgets.dart';

import 'fixtures.dart';

/// In-memory session store — no keychain, no platform channels.
class FakeSessionStore implements SessionStore {
  FakeSessionStore({this.token, this.careCircleId, this.deviceName});

  String? token;
  String? careCircleId;
  String? deviceName;
  bool cleared = false;

  @override
  Future<String?> readToken() async => token;

  @override
  Future<void> writeToken(String token) async => this.token = token;

  @override
  Future<String?> readActiveCareCircleId() async => careCircleId;

  @override
  Future<void> writeActiveCareCircleId(String? careCircleId) async =>
      this.careCircleId = careCircleId;

  @override
  Future<String?> readDeviceName() async => deviceName;

  @override
  Future<void> writeDeviceName(String deviceName) async =>
      this.deviceName = deviceName;

  @override
  Future<void> clearSession() async {
    cleared = true;
    token = null;
    careCircleId = null;
  }
}

/// Records what the app would have said out loud.
class RecordingAnnouncer extends Announcer {
  RecordingAnnouncer() : super();

  final List<String> messages = <String>[];

  @override
  Future<void> announce(BuildContext context, String message) async {
    messages.add(message);
  }
}

/// Records what the app would have dialled.
class FakePhoneActions extends PhoneActions {
  FakePhoneActions();

  final List<String> calls = <String>[];
  final List<String> messages = <String>[];

  @override
  Future<bool> call(String phoneNumber) async {
    calls.add(phoneNumber);
    return true;
  }

  @override
  Future<bool> sendSms(String phoneNumber, {String? body}) async {
    messages.add('$phoneNumber|${body ?? ''}');
    return true;
  }
}

class FakeAuthRepository implements AuthRepository {
  FakeAuthRepository({
    this.hasSessionValue = false,
    this.loginResult,
    this.registerResult,
    this.accountResult,
  });

  bool hasSessionValue;
  Result<AuthSession>? loginResult;
  Result<AuthSession>? registerResult;
  Result<AuthAccount>? accountResult;

  int loginCalls = 0;
  int registerCalls = 0;
  int loadAccountCalls = 0;
  int logoutCalls = 0;
  String? lastEmail;
  RegisterRequest? lastRegisterRequest;
  String? activeCareCircleId;

  @override
  Future<bool> hasSession() async => hasSessionValue;

  @override
  Future<Result<AuthSession>> login({
    required String email,
    required String password,
  }) async {
    loginCalls++;
    lastEmail = email;
    return loginResult ?? Ok<AuthSession>(buildAuthSession());
  }

  @override
  Future<Result<AuthSession>> register(RegisterRequest request) async {
    registerCalls++;
    lastRegisterRequest = request;
    return registerResult ?? Ok<AuthSession>(buildAuthSession());
  }

  @override
  Future<Result<AuthAccount>> loadAccount() async {
    loadAccountCalls++;
    return accountResult ?? Ok<AuthAccount>(buildAuthAccount());
  }

  @override
  Future<Result<void>> logout() async {
    logoutCalls++;
    return const Ok<void>(null);
  }

  @override
  Future<Result<void>> setActiveCareCircle(String careCircleId) async {
    activeCareCircleId = careCircleId;
    return const Ok<void>(null);
  }
}

class FakeTodayRepository implements TodayRepository {
  FakeTodayRepository({this.result});

  Result<TodaySummary>? result;
  int calls = 0;

  @override
  Future<Result<TodaySummary>> getToday() async {
    calls++;
    return result ?? Ok<TodaySummary>(buildTodaySummary());
  }
}

class FakeDoseRepository implements DoseRepository {
  FakeDoseRepository({this.result});

  Result<void>? result;
  final List<String> takeCalls = <String>[];
  final List<String> skipCalls = <String>[];
  final List<String> snoozeCalls = <String>[];

  @override
  Future<Result<void>> takeDose({required String doseId, String? photoBase64}) async {
    takeCalls.add(doseId);
    return result ?? const Ok<void>(null);
  }

  @override
  Future<Result<void>> skipDose({required String doseId, String? reason}) async {
    skipCalls.add('$doseId|${reason ?? ''}');
    return result ?? const Ok<void>(null);
  }

  @override
  Future<Result<void>> snoozeDose({required String doseId, required int minutes}) async {
    snoozeCalls.add('$doseId|$minutes');
    return result ?? const Ok<void>(null);
  }
}

class FakeMedicationRepository implements MedicationRepository {
  FakeMedicationRepository({this.result});

  Result<List<Medication>>? result;
  int calls = 0;

  @override
  Future<Result<List<Medication>>> listMedications() async {
    calls++;
    return result ?? Ok<List<Medication>>(<Medication>[buildMedication()]);
  }
}

class FakeAppointmentRepository implements AppointmentRepository {
  FakeAppointmentRepository({this.result});

  Result<List<Appointment>>? result;
  int calls = 0;

  @override
  Future<Result<List<Appointment>>> listAppointments() async {
    calls++;
    return result ?? Ok<List<Appointment>>(<Appointment>[buildAppointment()]);
  }
}

class FakeEmergencyRepository implements EmergencyRepository {
  FakeEmergencyRepository({this.alert, this.getResult});

  EmergencyAlert? alert;
  Result<EmergencyAlert>? getResult;
  Result<void>? acknowledgeResult;
  final List<EmergencyType> raiseCalls = <EmergencyType>[];
  final List<String> acknowledgeCalls = <String>[];
  int getCalls = 0;
  double? lastLatitude;
  double? lastLongitude;

  @override
  Future<Result<EmergencyAlert>> raise({
    required EmergencyType type,
    double? latitude,
    double? longitude,
    String? locationLabel,
    String? note,
  }) async {
    raiseCalls.add(type);
    lastLatitude = latitude;
    lastLongitude = longitude;
    return Ok<EmergencyAlert>(
      alert ?? buildEmergencyAlert(type: type),
    );
  }

  @override
  Future<Result<EmergencyAlert>> getAlert(String alertId) async {
    getCalls++;
    return getResult ?? Ok<EmergencyAlert>(alert ?? buildEmergencyAlert(id: alertId));
  }

  @override
  Future<Result<void>> acknowledge(String alertId) async {
    acknowledgeCalls.add(alertId);
    return acknowledgeResult ?? const Ok<void>(null);
  }
}

class FakeCareCircleRepository implements CareCircleRepository {
  FakeCareCircleRepository({this.result});

  Result<CareCircleDetails>? result;
  int calls = 0;

  @override
  Future<Result<CareCircleDetails>> getCareCircle() async {
    calls++;
    return result ?? Ok<CareCircleDetails>(buildCareCircleDetails());
  }
}

class FakeSettingsRepository implements SettingsRepository {
  FakeSettingsRepository({this.initial = const AccessibilitySettings()});

  AccessibilitySettings initial;
  AccessibilitySettings? written;

  @override
  AccessibilitySettings read() => initial;

  @override
  Future<void> write(AccessibilitySettings settings) async => written = settings;
}

/// Convenience failure for failure-path tests.
final Failure kNetworkFailure = const NetworkFailure();
