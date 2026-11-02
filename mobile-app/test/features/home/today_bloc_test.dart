import 'package:bloc_test/bloc_test.dart';
import 'package:care_circle_mobile/core/error/failure.dart';
import 'package:care_circle_mobile/core/error/result.dart';
import 'package:care_circle_mobile/features/home/domain/entities/today_summary.dart';
import 'package:care_circle_mobile/features/home/domain/usecases/get_today.dart';
import 'package:care_circle_mobile/features/home/presentation/bloc/today_bloc.dart';
import 'package:care_circle_mobile/features/home/presentation/bloc/today_event.dart';
import 'package:care_circle_mobile/features/home/presentation/bloc/today_state.dart';
import 'package:care_circle_mobile/features/medications/domain/usecases/skip_dose.dart';
import 'package:care_circle_mobile/features/medications/domain/usecases/snooze_dose.dart';
import 'package:care_circle_mobile/features/medications/domain/usecases/take_dose.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/fakes.dart';
import '../../support/fixtures.dart';

void main() {
  late FakeTodayRepository today;
  late FakeDoseRepository doses;

  TodayBloc build() => TodayBloc(
        getToday: GetToday(today),
        takeDose: TakeDose(doses),
        skipDose: SkipDose(doses),
        snoozeDose: SnoozeDose(doses),
      );

  setUp(() {
    today = FakeTodayRepository();
    doses = FakeDoseRepository();
  });

  group('TodayBloc', () {
    test('loads the day', () async {
      final TodayBloc bloc = build();

      bloc.add(const TodayRequested());
      await bloc.stream.firstWhere((TodayState state) => state.status == TodayStatus.ready);

      expect(bloc.state.summary?.doses, hasLength(1));
      expect(bloc.state.message, isNull);
    });

    test('a failed load is reported, not hidden', () async {
      today.result = const Err<TodaySummary>(NetworkFailure('offline'));
      final TodayBloc bloc = build();

      bloc.add(const TodayRequested());
      await bloc.stream.firstWhere((TodayState state) => state.hasFailed);

      expect(bloc.state.message, 'offline');
      expect(bloc.state.messageIsError, isTrue);
    });

    blocTest<TodayBloc, TodayState>(
      'one tap marks a dose taken, confirms it out loud, then reloads',
      build: build,
      seed: () => TodayState(
        status: TodayStatus.ready,
        summary: buildTodaySummary(),
      ),
      act: (TodayBloc bloc) =>
          bloc.add(const TodayTakeDoseRequested(doseId: 'dose-1')),
      expect: () => <Matcher>[
        isA<TodayState>().having(
          (TodayState s) => s.isDoseBusy('dose-1'),
          'dose marked busy',
          isTrue,
        ),
        isA<TodayState>()
            .having((TodayState s) => s.message, 'confirmation', 'Dose marked as taken.')
            .having((TodayState s) => s.messageIsError, 'is an error', isFalse)
            .having((TodayState s) => s.busyDoseIds, 'busy cleared', isEmpty),
      ],
      verify: (_) {
        expect(doses.takeCalls, <String>['dose-1']);
        expect(today.calls, 1, reason: 'the day is reloaded after the action');
      },
    );

    blocTest<TodayBloc, TodayState>(
      'a failed dose action keeps the dose on screen and explains the problem',
      build: () {
        doses.result = const Err<void>(NetworkFailure('offline'));
        return build();
      },
      seed: () => TodayState(
        status: TodayStatus.ready,
        summary: buildTodaySummary(),
      ),
      act: (TodayBloc bloc) =>
          bloc.add(const TodayTakeDoseRequested(doseId: 'dose-1')),
      skip: 1,
      expect: () => <Matcher>[
        isA<TodayState>()
            .having((TodayState s) => s.message, 'message', 'offline')
            .having((TodayState s) => s.messageIsError, 'is an error', isTrue)
            .having((TodayState s) => s.busyDoseIds, 'busy cleared', isEmpty),
      ],
      verify: (_) {
        expect(doses.takeCalls, <String>['dose-1']);
        expect(today.calls, 0, reason: 'no reload after a failure');
      },
    );

    test('skipping records the reason', () async {
      final TodayBloc bloc = build();

      bloc.add(
        const TodaySkipDoseRequested(doseId: 'dose-1', reason: 'Away from home'),
      );
      await bloc.stream.firstWhere((TodayState state) => state.message != null);

      expect(doses.skipCalls, <String>['dose-1|Away from home']);
    });

    test('snoozing sends the chosen number of minutes', () async {
      final TodayBloc bloc = build();

      bloc.add(const TodaySnoozeDoseRequested(doseId: 'dose-1', minutes: 30));
      await bloc.stream.firstWhere(
        (TodayState state) => state.message == 'Snoozed for 30 minutes.',
      );

      expect(doses.snoozeCalls, <String>['dose-1|30']);
    });

    blocTest<TodayBloc, TodayState>(
      'ignores a second press while a dose is already being saved',
      build: build,
      seed: () => TodayState(
        status: TodayStatus.ready,
        summary: buildTodaySummary(),
        busyDoseIds: const <String>{'dose-1'},
      ),
      act: (TodayBloc bloc) =>
          bloc.add(const TodayTakeDoseRequested(doseId: 'dose-1')),
      expect: () => <TodayState>[],
      verify: (_) => expect(doses.takeCalls, isEmpty),
    );
  });
}
