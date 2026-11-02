import 'package:care_circle_mobile/core/theme/app_theme.dart';
import 'package:care_circle_mobile/core/widgets/accessible_button.dart';
import 'package:care_circle_mobile/features/medications/presentation/widgets/medication_list_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/fakes.dart';
import '../../support/fixtures.dart';

Future<void> pumpCard(
  WidgetTester tester, {
  required Widget card,
  double textScale = 1,
}) async {
  await tester.pumpWidget(
    MaterialApp(
      theme: AppTheme.light(),
      home: MediaQuery(
        data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
        child: Scaffold(body: SingleChildScrollView(child: card)),
      ),
    ),
  );
}

void main() {
  group('MedicationListCard', () {
    testWidgets('shows schedule, stock and pharmacy', (WidgetTester tester) async {
      await pumpCard(
        tester,
        card: MedicationListCard(
          medication: buildMedication(
            daysRemaining: 3,
            isLowStock: true,
            pharmacyName: 'Corner Pharmacy',
            pharmacyPhone: '+15550100',
          ),
          onOpen: () {},
        ),
      );

      expect(find.text('Lisinopril 10 mg tablet, take one'), findsOneWidget);
      expect(find.textContaining('Once daily'), findsOneWidget);
      expect(find.textContaining('Running low'), findsOneWidget);
      expect(find.textContaining('Corner Pharmacy'), findsOneWidget);
    });

    testWidgets('one tap calls the pharmacy', (WidgetTester tester) async {
      final FakePhoneActions phone = FakePhoneActions();
      await pumpCard(
        tester,
        card: MedicationListCard(
          medication: buildMedication(pharmacyPhone: '+15550100'),
          onOpen: () {},
          phoneActions: phone,
        ),
      );

      await tester.tap(find.widgetWithText(AccessibleButton, 'Call pharmacy'));
      await tester.pump();

      expect(phone.calls, <String>['+15550100']);
    });

    testWidgets('a long medication name wraps at the largest text size',
        (WidgetTester tester) async {
      await pumpCard(
        tester,
        textScale: 2,
        card: MedicationListCard(
          medication: buildMedication(
            name: 'Metformin hydrochloride 1000 mg prolonged-release tablet',
            frequency: 'Twice daily with breakfast and the evening meal',
          ),
          onOpen: () {},
        ),
      );

      expect(tester.takeException(), isNull);
      expect(find.text('Metformin hydrochloride 1000 mg prolonged-release tablet'),
          findsOneWidget);
    });

    testWidgets('shows no pharmacy buttons without a number', (WidgetTester tester) async {
      await pumpCard(
        tester,
        card: MedicationListCard(medication: buildMedication(), onOpen: () {}),
      );

      expect(find.widgetWithText(AccessibleButton, 'Call pharmacy'), findsNothing);
    });
  });
}
