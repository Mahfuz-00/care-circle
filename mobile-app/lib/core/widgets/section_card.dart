import 'package:flutter/material.dart';

import '../theme/app_sizes.dart';

/// A calm card used across the app, with an optional heading that is announced
/// as a header by screen readers.
class SectionCard extends StatelessWidget {
  const SectionCard({
    required this.child,
    this.title,
    this.trailing,
    this.semanticsHeader = true,
    this.padding = const EdgeInsets.all(AppSizes.screenPadding),
    super.key,
  });

  final Widget child;
  final String? title;
  final Widget? trailing;
  final bool semanticsHeader;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final String? title = this.title;

    return Card(
      child: Padding(
        padding: padding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            if (title != null) ...<Widget>[
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Expanded(
                    child: Semantics(
                      header: semanticsHeader,
                      child: Text(title, style: theme.textTheme.titleLarge),
                    ),
                  ),
                  ?trailing,
                ],
              ),
              const SizedBox(height: AppSizes.gap),
            ],
            child,
          ],
        ),
      ),
    );
  }
}
