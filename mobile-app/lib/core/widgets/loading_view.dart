import 'package:flutter/material.dart';

import '../theme/app_sizes.dart';

/// A calm loading indicator that screen readers announce.
class LoadingView extends StatelessWidget {
  const LoadingView({this.label = 'Loading', super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      label: label,
      child: const Center(
        child: Padding(
          padding: EdgeInsets.all(AppSizes.gapLarge),
          child: ExcludeSemantics(
            child: SizedBox.square(
              dimension: 48,
              child: CircularProgressIndicator(strokeWidth: 5),
            ),
          ),
        ),
      ),
    );
  }
}
