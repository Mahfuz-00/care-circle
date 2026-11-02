import 'package:flutter/material.dart';

import '../theme/app_sizes.dart';

/// A button that is always reachable and always at least 48dp tall, with the
/// label exposed to screen readers as a button (PRD §9).
///
/// The visual label is excluded from semantics so the screen reader reads the
/// [semanticsLabel] once, plus the optional [semanticsHint].
class AccessibleButton extends StatelessWidget {
  const AccessibleButton({
    required this.label,
    required this.onPressed,
    this.icon,
    this.semanticsLabel,
    this.semanticsHint,
    this.minHeight = AppSizes.primaryButtonHeight,
    this.expand = false,
    this.filled = true,
    this.busy = false,
    this.isDestructive = false,
    super.key,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final String? semanticsLabel;
  final String? semanticsHint;
  final double minHeight;
  final bool expand;
  final bool filled;
  final bool busy;
  final bool isDestructive;

  @override
  Widget build(BuildContext context) {
    final bool enabled = onPressed != null && !busy;
    final ButtonStyle style = isDestructive
        ? FilledButton.styleFrom(
            backgroundColor: Theme.of(context).colorScheme.error,
            foregroundColor: Theme.of(context).colorScheme.onError,
            minimumSize: Size(AppSizes.minTouchTarget, minHeight),
          )
        : FilledButton.styleFrom(minimumSize: Size(AppSizes.minTouchTarget, minHeight));

    final Widget content = busy
        ? const SizedBox.square(
            dimension: 26,
            child: CircularProgressIndicator(strokeWidth: 3, color: Colors.white),
          )
        : _labelWithIcon();

    final Widget button = filled
        ? FilledButton(
            onPressed: enabled ? onPressed : null,
            style: style,
            child: content,
          )
        : OutlinedButton(
            onPressed: enabled ? onPressed : null,
            style: OutlinedButton.styleFrom(minimumSize: Size(AppSizes.minTouchTarget, minHeight)),
            child: content,
          );

    return Semantics(
      button: true,
      enabled: enabled,
      label: semanticsLabel ?? label,
      hint: semanticsHint,
      child: ExcludeSemantics(
        child: ConstrainedBox(
          constraints: BoxConstraints(
            minHeight: minHeight,
            minWidth: AppSizes.minTouchTarget,
          ),
          child: expand ? SizedBox(width: double.infinity, child: button) : button,
        ),
      ),
    );
  }

  Widget _labelWithIcon() {
    if (icon == null) {
      return Text(label, textAlign: TextAlign.center, softWrap: true);
    }
    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        Icon(icon),
        const SizedBox(width: 10),
        Flexible(child: Text(label, softWrap: true)),
      ],
    );
  }
}
