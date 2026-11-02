import 'package:flutter/material.dart';

import '../../../../core/theme/app_sizes.dart';
import '../../../../core/widgets/accessible_button.dart';

/// Why a dose was skipped.
///
/// PRD §7: a skipped action is recorded **with the reason**. The options are
/// neutral logistics — the app never asks for symptoms or gives advice.
class SkipReasonOutcome {
  const SkipReasonOutcome(this.reason);

  /// `null` (or empty) means the person skipped without giving a reason.
  final String? reason;
}

const List<String> kSkipReasonOptions = <String>[
  'Away from home',
  'Already taken it',
  'Out of pills',
  'Not needed today',
];

/// Asks for a reason before skipping. Returns `null` when cancelled.
Future<SkipReasonOutcome?> showSkipReasonSheet(
  BuildContext context, {
  required String medicationName,
}) {
  return showModalBottomSheet<SkipReasonOutcome>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (BuildContext sheetContext) => _SkipReasonSheet(
      medicationName: medicationName,
    ),
  );
}

class _SkipReasonSheet extends StatefulWidget {
  const _SkipReasonSheet({required this.medicationName});

  final String medicationName;

  @override
  State<_SkipReasonSheet> createState() => _SkipReasonSheetState();
}

class _SkipReasonSheetState extends State<_SkipReasonSheet> {
  String? _selected;
  final TextEditingController _note = TextEditingController();

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);

    return SafeArea(
      child: Padding(
        padding: EdgeInsets.fromLTRB(
          AppSizes.screenPadding,
          AppSizes.gap,
          AppSizes.screenPadding,
          AppSizes.screenPadding + MediaQuery.viewInsetsOf(context).bottom,
        ),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Semantics(
                header: true,
                child: Text(
                  'Skip ${widget.medicationName}',
                  style: theme.textTheme.titleLarge,
                  softWrap: true,
                  maxLines: null,
                ),
              ),
              const SizedBox(height: AppSizes.gap / 2),
              Text(
                'Your care circle will see that this dose was skipped and why.',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                softWrap: true,
                maxLines: null,
              ),
              const SizedBox(height: AppSizes.gapLarge),
              RadioGroup<String>(
                groupValue: _selected,
                onChanged: (String? value) => setState(() => _selected = value),
                child: Column(
                  children: <Widget>[
                    for (final String reason in kSkipReasonOptions)
                      RadioListTile<String>(
                        value: reason,
                        title: Text(reason, style: theme.textTheme.bodyLarge),
                        contentPadding: EdgeInsets.zero,
                      ),
                  ],
                ),
              ),
              const SizedBox(height: AppSizes.gap),
              TextField(
                controller: _note,
                textInputAction: TextInputAction.done,
                style: theme.textTheme.bodyLarge,
                decoration: const InputDecoration(
                  labelText: 'Add a note (optional)',
                  helperText: 'For example: the bottle was empty.',
                ),
              ),
              const SizedBox(height: AppSizes.gapLarge),
              AccessibleButton(
                label: 'Save and skip',
                icon: Icons.check,
                expand: true,
                onPressed: () => Navigator.of(context).pop(
                  SkipReasonOutcome(
                    _note.text.trim().isEmpty ? _selected : _note.text.trim(),
                  ),
                ),
                semanticsHint: 'Records that you skipped this dose',
              ),
              const SizedBox(height: AppSizes.gap),
              AccessibleButton(
                label: 'Keep this dose',
                filled: false,
                expand: true,
                onPressed: () => Navigator.of(context).pop(),
                semanticsHint: 'Closes without skipping',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
