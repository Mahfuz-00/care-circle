import 'package:care_circle_mobile/core/theme/app_theme.dart';
import 'package:care_circle_mobile/core/widgets/accessible_button.dart';
import 'package:care_circle_mobile/core/widgets/medication_name_text.dart';
import 'package:care_circle_mobile/features/medications/domain/entities/dose.dart';
import 'package:care_circle_mobile/features/medications/presentation/widgets/dose_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/fixtures.dart';

Future<void> pumpCard(
  WidgetTester tester,
  Dose dose, {
  VoidCallback? onTake,
  VoidCallback? onSkip,
  VoidCallback? onSnooze,
  bool busy = false,
  double textScale = 1,
}) async {
  await tester.pumpWidget(
    MaterialApp(
      theme: AppTheme.light(),
      home: MediaQuery(
        data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
        child: Scaffold(
          body: SingleChildScrollView(
            child: DoseCard(
              dose: dose,
              onTake: onTake,
              onSkip: onSkip,
              onSnooze: onSnooze,
              busy: busy,
              now: kNow,
            ),
          ),
        ),
      ),
    ),
  );
}

void main() {
  group('DoseCard', () {
    testWidgets('shows the dose and the three one-tap actions',
        (WidgetTester tester) async {
      await pumpCard(tester, buildDose(scheduledFor: DateTime(2026, 10, 14, 10)));

      expect(find.text('Metformin 500 mg'), findsOneWidget);
      expect(find.text('1 tablet'), findsOneWidget);
      expect(find.textContaining('Due at'), findsOneWidget);
      expect(find.widgetWithText(AccessibleButton, 'I took it'), findsOneWidget);
      expect(find.widgetWithText(AccessibleButton, 'Skip'), findsOneWidget);
      expect(find.widgetWithText(AccessibleButton, 'Snooze'), findsOneWidget);
    });

    testWidgets('each action fires once on a single tap', (WidgetTester tester) async {
      int taken = 0;
      int skipped = 0;
      int snoozed = 0;
      await pumpCard(
        tester,
        buildDose(),
        onTake: () => taken++,
        onSkip: () => skipped++,
        onSnooze: () => snoozed++,
      );

      await tester.tap(find.widgetWithText(AccessibleButton, 'I took it'));
      await tester.tap(find.widgetWithText(AccessibleButton, 'Skip'));
      await tester.tap(find.widgetWithText(AccessibleButton, 'Snooze'));
      await tester.pump();

      expect(taken, 1);
      expect(skipped, 1);
      expect(snoozed, 1);
    });

    testWidgets('every action is at least 48dp tall', (WidgetTester tester) async {
      await pumpCard(tester, buildDose());

      for (final String label in <String>['I took it', 'Skip', 'Snooze']) {
        final Size size = tester.getSize(find.widgetWithText(AccessibleButton, label));
        expect(size.height, greaterThanOrEqualTo(48), reason: label);
        expect(size.width, greaterThanOrEqualTo(48), reason: label);
      }
    });

    testWidgets('a long medication name wraps instead of truncating',
        (WidgetTester tester) async {
      await pumpCard(
        tester,
        buildDose(
          medication: buildDoseMedication(
            name: 'Amlodipine 5 mg tablet with a deliberately long pharmacy label',
          ),
        ),
        textScale: 2,
      );

      final Text nameText = tester.widget<Text>(
        find.descendant(
          of: find.byType(MedicationNameText),
          matching: find.byType(Text),
        ),
      );

      expect(nameText.maxLines, isNull, reason: 'medication names never truncate');
      expect(nameText.overflow, isNot(TextOverflow.ellipsis));
      expect(nameText.softWrap, isTrue);
      expect(tester.takeException(), isNull);
      // It really wrapped onto more than one line.
      expect(
        tester.getSize(find.byType(MedicationNameText)).height,
        greaterThan(60),
      );
    });

    testWidgets('a completed dose shows no actions', (WidgetTester tester) async {
      await pumpCard(
        tester,
        buildDose(
          status: DoseStatus.taken,
          takenAt: DateTime(2026, 10, 14, 8, 4),
        ),
        onTake: () {},
      );

      expect(find.widgetWithText(AccessibleButton, 'I took it'), findsNothing);
      expect(find.textContaining('Taken at'), findsOneWidget);
    });

    testWidgets('a skipped dose shows the recorded reason', (WidgetTester tester) async {
      await pumpCard(
        tester,
        buildDose(status: DoseStatus.skipped, skipReason: 'Away from home'),
      );

      expect(find.textContaining('Away from home'), findsOneWidget);
    });

    testWidgets('an overdue pending dose is flagged as overdue',
        (WidgetTester tester) async {
      await pumpCard(
        tester,
        buildDose(status: DoseStatus.pending, scheduledFor: DateTime(2026, 10, 14, 8)),
      );

      expect(find.text('Overdue'), findsOneWidget);
    });

    testWidgets('while saving, the actions are disabled and progress is announced',
        (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      int taken = 0;
      await pumpCard(tester, buildDose(), onTake: () => taken++, busy: true);

      await tester.tap(find.widgetWithText(AccessibleButton, 'I took it'));
      await tester.pump();

      expect(taken, 0);
      expect(find.byType(LinearProgressIndicator), findsOneWidget);
      expect(find.bySemanticsLabel('Saving this dose'), findsOneWidget);

      handle.dispose();
    });
  });
}
