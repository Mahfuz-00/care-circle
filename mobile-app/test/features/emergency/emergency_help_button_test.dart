import 'package:care_circle_mobile/core/theme/app_sizes.dart';
import 'package:care_circle_mobile/core/theme/app_theme.dart';
import 'package:care_circle_mobile/features/emergency/presentation/widgets/emergency_help_button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

Future<void> pumpButton(
  WidgetTester tester, {
  required VoidCallback onPressed,
  bool busy = false,
  double textScale = 1,
}) async {
  await tester.pumpWidget(
    MaterialApp(
      theme: AppTheme.light(),
      home: MediaQuery(
        data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
        child: Scaffold(
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(AppSizes.screenPadding),
              child: EmergencyHelpButton(onPressed: onPressed, busy: busy),
            ),
          ),
        ),
      ),
    ),
  );
}

void main() {
  group('EmergencyHelpButton', () {
    testWidgets('one deliberate press raises exactly one alert', (WidgetTester tester) async {
      int presses = 0;
      await pumpButton(tester, onPressed: () => presses++);

      await tester.tap(find.byType(EmergencyHelpButton));
      await tester.pump();

      expect(presses, 1);
    });

    testWidgets('is at least 64dp tall and reaches the 96dp guidance',
        (WidgetTester tester) async {
      await pumpButton(tester, onPressed: () {});

      final Size size = tester.getSize(find.byType(EmergencyHelpButton));

      expect(size.height, greaterThanOrEqualTo(64));
      expect(size.height, AppSizes.emergencyButtonHeight);
      expect(size.width, greaterThanOrEqualTo(48));
    });

    testWidgets('names itself and its consequence to the screen reader',
        (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      await pumpButton(tester, onPressed: () {});

      expect(
        find.bySemanticsLabel(RegExp('I need help. Sends an emergency alert')),
        findsOneWidget,
      );

      handle.dispose();
    });

    testWidgets('stays readable and tappable at the largest text size',
        (WidgetTester tester) async {
      int presses = 0;
      await pumpButton(tester, onPressed: () => presses++, textScale: 2);

      expect(tester.takeException(), isNull);

      await tester.tap(find.byType(EmergencyHelpButton));
      await tester.pump();

      expect(presses, 1);
      expect(tester.getSize(find.byType(EmergencyHelpButton)).height,
          greaterThanOrEqualTo(64));
    });

    testWidgets('while busy it cannot be pressed again', (WidgetTester tester) async {
      int presses = 0;
      await pumpButton(tester, onPressed: () => presses++, busy: true);

      await tester.tap(find.byType(EmergencyHelpButton));
      await tester.pump();

      expect(presses, 0);
    });
  });
}
