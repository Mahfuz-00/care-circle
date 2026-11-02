import 'package:care_circle_mobile/core/error/failure.dart';
import 'package:care_circle_mobile/core/error/result.dart';
import 'package:care_circle_mobile/features/emergency/domain/entities/emergency_alert.dart';
import 'package:care_circle_mobile/features/emergency/domain/usecases/acknowledge_emergency.dart';
import 'package:care_circle_mobile/features/emergency/domain/usecases/get_emergency_alert.dart';
import 'package:care_circle_mobile/features/emergency/domain/usecases/raise_emergency.dart';
import 'package:care_circle_mobile/features/emergency/presentation/bloc/emergency_bloc.dart';
import 'package:care_circle_mobile/features/emergency/presentation/bloc/emergency_event.dart';
import 'package:care_circle_mobile/features/emergency/presentation/bloc/emergency_state.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/fakes.dart';
import '../../support/fixtures.dart';

void main() {
  late FakeEmergencyRepository repository;

  EmergencyBloc build() => EmergencyBloc(
        raiseEmergency: RaiseEmergency(repository),
        getEmergencyAlert: GetEmergencyAlert(repository),
        acknowledgeEmergency: AcknowledgeEmergency(repository),
      );

  setUp(() => repository = FakeEmergencyRepository());

  group('EmergencyBloc', () {
    test('one press raises exactly one alert', () async {
      final EmergencyBloc bloc = build();

      bloc.add(const EmergencyRaiseRequested(type: EmergencyType.fall));
      await bloc.stream.firstWhere(
        (EmergencyState state) => state.phase == EmergencyPhase.active,
      );

      expect(repository.raiseCalls, <EmergencyType>[EmergencyType.fall]);
      expect(bloc.state.alert, isNotNull);
      expect(bloc.state.isWaitingForHelp, isTrue);
      expect(bloc.state.message, 'Your care circle has been told you need help.');
    });

    test('pressing again while an alert is open never sends a second alert', () async {
      final EmergencyBloc bloc = build();

      bloc.add(const EmergencyRaiseRequested(type: EmergencyType.medical));
      await bloc.stream.firstWhere(
        (EmergencyState state) => state.phase == EmergencyPhase.active,
      );

      bloc.add(const EmergencyRaiseRequested(type: EmergencyType.medical));
      await bloc.stream.firstWhere(
        (EmergencyState state) =>
            state.message == 'Your care circle already has your alert.',
      );

      expect(repository.raiseCalls, hasLength(1));
    });

    test('a failed alert is reported so the senior can try again', () async {
      final EmergencyBloc bloc = EmergencyBloc(
        raiseEmergency: RaiseEmergency(_FailingEmergencyRepository()),
        getEmergencyAlert: GetEmergencyAlert(repository),
        acknowledgeEmergency: AcknowledgeEmergency(repository),
      );

      bloc.add(const EmergencyRaiseRequested(type: EmergencyType.medical));
      await bloc.stream.firstWhere(
        (EmergencyState state) => state.phase == EmergencyPhase.failed,
      );

      expect(bloc.state.message, 'offline');
      expect(bloc.state.messageIsError, isTrue);
      expect(bloc.state.alert, isNull);
    });

    test('acknowledging records it and reloads the alert', () async {
      repository.alert = buildEmergencyAlert(
        status: EmergencyStatus.acknowledged,
        acknowledgedBy: const EmergencyActor(id: 'u-2', name: 'Daniel Bennett'),
      );
      final EmergencyBloc bloc = build();

      bloc.add(const EmergencyRaiseRequested(type: EmergencyType.medical));
      await bloc.stream.firstWhere(
        (EmergencyState state) => state.phase == EmergencyPhase.active,
      );

      bloc.add(const EmergencyAcknowledgeRequested());
      await bloc.stream.firstWhere(
        (EmergencyState state) => state.message == 'Marked as answered.',
      );

      expect(repository.acknowledgeCalls, <String>['alert-1']);
      expect(repository.getCalls, 1);
      expect(bloc.state.alert?.acknowledgedBy?.name, 'Daniel Bennett');
      expect(bloc.state.isWaitingForHelp, isFalse);
    });

    test('resetting clears the finished alert', () async {
      final EmergencyBloc bloc = build();

      bloc.add(const EmergencyRaiseRequested(type: EmergencyType.medical));
      await bloc.stream.firstWhere(
        (EmergencyState state) => state.phase == EmergencyPhase.active,
      );

      bloc.add(const EmergencyReset());
      await bloc.stream.firstWhere((EmergencyState state) => !state.hasAlert);

      expect(bloc.state.phase, EmergencyPhase.idle);
    });
  });
}

class _FailingEmergencyRepository extends FakeEmergencyRepository {
  @override
  Future<Result<EmergencyAlert>> raise({
    required EmergencyType type,
    double? latitude,
    double? longitude,
    String? locationLabel,
    String? note,
  }) async =>
      const Err<EmergencyAlert>(NetworkFailure('offline'));
}
