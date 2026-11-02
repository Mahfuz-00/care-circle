import 'package:flutter/material.dart';

/// Medication names are never truncated (AGENTS.md mobile conventions):
/// they wrap onto as many lines as they need, at any OS text scale.
class MedicationNameText extends StatelessWidget {
  const MedicationNameText(
    this.name, {
    this.style,
    this.textAlign,
    this.semanticsLabel,
    super.key,
  });

  final String name;
  final TextStyle? style;
  final TextAlign? textAlign;
  final String? semanticsLabel;

  @override
  Widget build(BuildContext context) {
    final Text text = Text(
      name,
      style: style ?? Theme.of(context).textTheme.titleLarge,
      textAlign: textAlign,
      softWrap: true,
      // Explicitly never truncate.
      maxLines: null,
      overflow: TextOverflow.visible,
    );

    if (semanticsLabel == null) return text;
    return Semantics(label: semanticsLabel, child: ExcludeSemantics(child: text));
  }
}
