import 'package:flutter/material.dart';

import '../theme/app_sizes.dart';
import 'accessible_button.dart';
import 'message_banner.dart';

/// A problem the person can act on: the message plus one big "Try again".
class ErrorRetryView extends StatelessWidget {
  const ErrorRetryView({
    required this.message,
    required this.onRetry,
    this.retryLabel = 'Try again',
    super.key,
  });

  final String message;
  final VoidCallback onRetry;
  final String retryLabel;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        MessageBanner(message: message, tone: MessageBannerTone.error),
        const SizedBox(height: AppSizes.gapLarge),
        AccessibleButton(
          label: retryLabel,
          icon: Icons.refresh,
          onPressed: onRetry,
          semanticsHint: 'Reloads this screen from CareCircle',
        ),
      ],
    );
  }
}
