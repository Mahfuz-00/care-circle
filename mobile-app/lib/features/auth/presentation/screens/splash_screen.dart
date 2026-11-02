import 'package:flutter/material.dart';

import '../../../../core/config/app_config.dart';
import '../../../../core/theme/app_sizes.dart';
import '../../../../core/widgets/loading_view.dart';

/// Shown while the stored session is checked (PRD §9: no flash of the wrong
/// screen).
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);

    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.screenPadding + 8),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Icon(Icons.diversity_1, size: 96, color: theme.colorScheme.primary),
              const SizedBox(height: AppSizes.gapLarge),
              Text(
                AppConfig.appName,
                style: theme.textTheme.displaySmall,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSizes.gap / 2),
              Text(
                'Medicines and visits, together with the people who care.',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSizes.gapLarge),
              const LoadingView(label: 'Loading your care circle'),
            ],
          ),
        ),
      ),
    );
  }
}
