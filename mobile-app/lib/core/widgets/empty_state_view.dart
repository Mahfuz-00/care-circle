import 'package:flutter/material.dart';

import '../theme/app_sizes.dart';

/// Shown when a list is legitimately empty (never as a stand-in for an error).
class EmptyStateView extends StatelessWidget {
  const EmptyStateView({
    required this.title,
    this.message,
    this.icon = Icons.inbox_outlined,
    this.action,
    super.key,
  });

  final String title;
  final String? message;
  final IconData icon;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final String? message = this.message;

    return Semantics(
      container: true,
      label: <String?>[title, message].whereType<String>().join('. '),
      child: ExcludeSemantics(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: AppSizes.gapLarge),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Icon(icon, size: 44, color: theme.colorScheme.onSurfaceVariant),
              const SizedBox(height: AppSizes.gap),
              Text(title, style: theme.textTheme.titleLarge, softWrap: true, maxLines: null),
              if (message != null) ...<Widget>[
                const SizedBox(height: AppSizes.gap / 2),
                Text(
                  message,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  softWrap: true,
                  maxLines: null,
                ),
              ],
              if (action != null) ...<Widget>[
                const SizedBox(height: AppSizes.gapLarge),
                action!,
              ],
            ],
          ),
        ),
      ),
    );
  }
}
