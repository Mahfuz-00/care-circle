import 'package:flutter/material.dart';

import '../../../../core/config/app_config.dart';
import '../../../../core/theme/app_sizes.dart';
import '../../../../core/widgets/accessible_button.dart';

/// Picks how long to snooze a dose. Returns `null` when cancelled.
Future<int?> showSnoozeDialog(BuildContext context, {required String medicationName}) {
  return showDialog<int>(
    context: context,
    barrierDismissible: true,
    builder: (BuildContext dialogContext) => AlertDialog(
      title: Text('Snooze $medicationName', softWrap: true, maxLines: null),
      content: const Text(
        'Choose when CareCircle should remind you again.',
        softWrap: true,
        maxLines: null,
      ),
      actionsAlignment: MainAxisAlignment.center,
      actions: <Widget>[
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            for (final int minutes in AppConfig.snoozeMinutesOptions)
              Padding(
                padding: const EdgeInsets.only(bottom: AppSizes.gap),
                child: AccessibleButton(
                  label: minutes < 60 ? '$minutes minutes' : '${minutes ~/ 60} hour',
                  icon: Icons.snooze,
                  expand: true,
                  onPressed: () => Navigator.of(dialogContext).pop(minutes),
                  semanticsHint: 'Reminds you about this dose in ${minutes < 60 ? '$minutes minutes' : '${minutes ~/ 60} hour'}',
                ),
              ),
            AccessibleButton(
              label: 'Cancel',
              filled: false,
              expand: true,
              onPressed: () => Navigator.of(dialogContext).pop(),
              semanticsHint: 'Keeps the dose due now',
            ),
          ],
        ),
      ],
    ),
  );
}
