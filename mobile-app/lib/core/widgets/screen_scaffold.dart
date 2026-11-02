import 'package:flutter/material.dart';

import '../theme/app_sizes.dart';

/// Standard screen chrome: a large app-bar title announced as a header, an
/// optional bottom bar, and consistent padding.
///
/// Set [scrollable] when the whole screen should scroll as one column. Screens
/// with a pinned element (the emergency button on Today) leave it false and
/// manage their own scroll area.
class ScreenScaffold extends StatelessWidget {
  const ScreenScaffold({
    required this.title,
    required this.child,
    this.actions,
    this.leading,
    this.bottomBar,
    this.scrollable = false,
    this.padding = const EdgeInsets.symmetric(
      horizontal: AppSizes.screenPadding,
      vertical: AppSizes.screenPadding,
    ),
    super.key,
  });

  final String title;
  final Widget child;
  final List<Widget>? actions;
  final Widget? leading;
  final Widget? bottomBar;
  final bool scrollable;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: leading,
        title: Semantics(header: true, child: Text(title)),
        actions: actions,
      ),
      body: SafeArea(
        top: false,
        child: scrollable
            ? SingleChildScrollView(padding: padding, child: child)
            : Padding(padding: padding, child: child),
      ),
      bottomNavigationBar: bottomBar,
    );
  }
}
