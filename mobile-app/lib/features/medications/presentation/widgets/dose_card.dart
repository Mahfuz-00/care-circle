import 'package:flutter/material.dart';

import '../../../../core/theme/app_sizes.dart';
import '../../../../core/utils/date_formatting.dart';
import '../../../../core/widgets/accessible_button.dart';
import '../../../../core/widgets/medication_name_text.dart';
import '../../domain/entities/dose.dart';

/// One scheduled dose with the three one-tap actions (PRD §5.1, §13).
///
/// Presentational only: the actions are callbacks, so the same card can be
/// driven by the home screen, the medication detail screen, or a notification
/// action without touching the BLoC.
class DoseCard extends StatelessWidget {
  const DoseCard({
    required this.dose,
    this.onTake,
    this.onSkip,
    this.onSnooze,
    this.busy = false,
    this.now,
    super.key,
  });

  final Dose dose;
  final VoidCallback? onTake;
  final VoidCallback? onSkip;
  final VoidCallback? onSnooze;

  /// True while an action for this dose is in flight.
  final bool busy;

  final DateTime? now;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final bool overdue = dose.isOverdue(now ?? DateTime.now());

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSizes.gapLarge),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Semantics(
              container: true,
              label: _summaryForScreenReader(overdue: overdue),
              child: ExcludeSemantics(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Expanded(
                          child: MedicationNameText(dose.medication.name),
                        ),
                        const SizedBox(width: AppSizes.gap),
                        _StatusChip(dose: dose, overdue: overdue),
                      ],
                    ),
                    const SizedBox(height: AppSizes.gap / 2),
                    Text(
                      dose.medication.dosage,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      softWrap: true,
                      maxLines: null,
                    ),
                    const SizedBox(height: AppSizes.gap / 2),
                    Text(
                      overdue
                          ? 'Was due at ${DateFormatting.time(dose.scheduledFor)}'
                          : 'Due at ${DateFormatting.time(dose.scheduledFor)}',
                      style: theme.textTheme.bodyLarge,
                      softWrap: true,
                      maxLines: null,
                    ),
                    if (dose.takenAt != null)
                      Text(
                        'Taken at ${DateFormatting.time(dose.takenAt!)}',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.primary,
                        ),
                        softWrap: true,
                      ),
                    if (dose.skipReason != null && dose.skipReason!.isNotEmpty)
                      Text(
                        'Reason recorded: ${dose.skipReason}',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                        softWrap: true,
                        maxLines: null,
                      ),
                  ],
                ),
              ),
            ),
            if (dose.needsAction) ...<Widget>[
              const SizedBox(height: AppSizes.gapLarge),
              Wrap(
                spacing: AppSizes.gap,
                runSpacing: AppSizes.gap,
                children: <Widget>[
                  AccessibleButton(
                    label: 'I took it',
                    icon: Icons.check_circle_outline,
                    onPressed: busy ? null : onTake,
                    minHeight: AppSizes.primaryButtonHeight,
                    semanticsLabel: 'I took ${dose.medication.name}',
                    semanticsHint: 'Records that you took this dose',
                  ),
                  AccessibleButton(
                    label: 'Skip',
                    icon: Icons.skip_next_outlined,
                    filled: false,
                    onPressed: busy ? null : onSkip,
                    minHeight: AppSizes.primaryButtonHeight,
                    semanticsLabel: 'Skip ${dose.medication.name}',
                    semanticsHint: 'Records that you skipped this dose',
                  ),
                  AccessibleButton(
                    label: 'Snooze',
                    icon: Icons.snooze_outlined,
                    filled: false,
                    onPressed: busy ? null : onSnooze,
                    minHeight: AppSizes.primaryButtonHeight,
                    semanticsLabel: 'Snooze ${dose.medication.name}',
                    semanticsHint: 'Reminds you again a little later',
                  ),
                ],
              ),
              if (busy)
                const Padding(
                  padding: EdgeInsets.only(top: AppSizes.gap),
                  child: _DoseActionProgress(),
                ),
            ],
          ],
        ),
      ),
    );
  }

  String _summaryForScreenReader({required bool overdue}) {
    final List<String> parts = <String>[
      dose.medication.name,
      dose.medication.dosage,
      '${dose.status.label}${overdue ? ', overdue' : ''}',
      'Scheduled for ${DateFormatting.time(dose.scheduledFor)}',
    ];
    if (dose.takenAt != null) {
      parts.add('Taken at ${DateFormatting.time(dose.takenAt!)}');
    }
    if (dose.skipReason != null && dose.skipReason!.isNotEmpty) {
      parts.add('Reason recorded: ${dose.skipReason}');
    }
    return parts.join('. ');
  }
}

/// Announced while a dose action is being saved, so a screen-reader user knows
/// the tap landed.
class _DoseActionProgress extends StatelessWidget {
  const _DoseActionProgress();

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      label: 'Saving this dose',
      child: const ExcludeSemantics(child: LinearProgressIndicator()),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.dose, required this.overdue});

  final Dose dose;
  final bool overdue;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final (Color background, Color foreground) = switch (dose.status) {
      DoseStatus.taken => (
          theme.colorScheme.primaryContainer,
          theme.colorScheme.onPrimaryContainer,
        ),
      DoseStatus.skipped || DoseStatus.missed => (
          theme.colorScheme.surfaceContainerHighest,
          theme.colorScheme.onSurfaceVariant,
        ),
      DoseStatus.snoozed => (
          theme.colorScheme.secondaryContainer,
          theme.colorScheme.onSecondaryContainer,
        ),
      DoseStatus.pending => overdue
          ? (theme.colorScheme.error, theme.colorScheme.onError)
          : (theme.colorScheme.secondaryContainer, theme.colorScheme.onSecondaryContainer),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Text(
        overdue && dose.status == DoseStatus.pending ? 'Overdue' : dose.status.label,
        style: theme.textTheme.labelMedium?.copyWith(color: foreground),
        softWrap: true,
      ),
    );
  }
}
