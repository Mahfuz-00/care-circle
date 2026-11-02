import 'package:flutter/material.dart';

import '../../../../core/actions/phone_actions.dart';
import '../../../../core/theme/app_sizes.dart';
import '../../../../core/widgets/accessible_button.dart';
import '../../../../core/widgets/medication_name_text.dart';
import '../../../../core/widgets/message_banner.dart';
import '../../domain/entities/medication.dart';

/// One medication in the list: never truncated, always with its stock state
/// and a one-tap way to reach the pharmacy (PRD §5.1).
class MedicationListCard extends StatelessWidget {
  const MedicationListCard({
    required this.medication,
    required this.onOpen,
    this.phoneActions = const PhoneActions(),
    super.key,
  });

  final Medication medication;
  final VoidCallback onOpen;
  final PhoneActions phoneActions;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSizes.gapLarge),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Semantics(
              container: true,
              label: _summary,
              child: ExcludeSemantics(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    MedicationNameText(medication.name),
                    const SizedBox(height: AppSizes.gap / 2),
                    Text(
                      medication.dosage,
                      style: theme.textTheme.bodyLarge,
                      softWrap: true,
                      maxLines: null,
                    ),
                    const SizedBox(height: AppSizes.gap / 2),
                    Text(
                      medication.scheduleSummary,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      softWrap: true,
                      maxLines: null,
                    ),
                    if (medication.withFood) ...<Widget>[
                      const SizedBox(height: AppSizes.gap / 2),
                      Text(
                        'With food',
                        style: theme.textTheme.bodyLarge?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                        softWrap: true,
                      ),
                    ],
                  ],
                ),
              ),
            ),
            if (medication.isRunningLow) ...<Widget>[
              const SizedBox(height: AppSizes.gap),
              MessageBanner(
                message: _stockMessage(medication),
                tone: MessageBannerTone.warning,
              ),
            ] else if (medication.daysRemaining != null) ...<Widget>[
              const SizedBox(height: AppSizes.gap),
              Text(
                'About ${medication.daysRemaining} days of stock left.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                softWrap: true,
                maxLines: null,
              ),
            ],
            if (medication.hasPharmacyContact) ...<Widget>[
              const SizedBox(height: AppSizes.gap),
              Text(
                medication.pharmacyName == null || medication.pharmacyName!.isEmpty
                    ? 'Pharmacy: ${medication.pharmacyPhone}'
                    : 'Pharmacy: ${medication.pharmacyName}'
                        '${medication.pharmacyPhone == null || medication.pharmacyPhone!.isEmpty ? '' : ' · ${medication.pharmacyPhone}'}',
                style: theme.textTheme.bodyLarge,
                softWrap: true,
                maxLines: null,
              ),
            ],
            const SizedBox(height: AppSizes.gap),
            Wrap(
              spacing: AppSizes.gap,
              runSpacing: AppSizes.gap,
              children: <Widget>[
                AccessibleButton(
                  label: 'Details',
                  icon: Icons.info_outline,
                  filled: false,
                  onPressed: onOpen,
                  semanticsLabel: 'Details for ${medication.name}',
                  semanticsHint: 'Opens schedule, stock and pharmacy',
                ),
                if (medication.pharmacyPhone != null &&
                    medication.pharmacyPhone!.isNotEmpty) ...<Widget>[
                  AccessibleButton(
                    label: 'Call pharmacy',
                    icon: Icons.phone,
                    onPressed: () => phoneActions.call(medication.pharmacyPhone!),
                    semanticsLabel: 'Call the pharmacy about ${medication.name}',
                    semanticsHint: 'Opens your phone app and dials the pharmacy',
                  ),
                  AccessibleButton(
                    label: 'Text pharmacy',
                    icon: Icons.sms_outlined,
                    filled: false,
                    onPressed: () => phoneActions.sendSms(
                      medication.pharmacyPhone!,
                      body: 'Hello, I would like to order more of ${medication.name}.',
                    ),
                    semanticsLabel: 'Text the pharmacy about ${medication.name}',
                    semanticsHint: 'Opens your messaging app',
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  String get _summary => <String>[
        medication.name,
        medication.dosage,
        medication.scheduleSummary,
        if (medication.withFood) 'with food',
        if (medication.isRunningLow) _stockMessage(medication),
        if (medication.pharmacyName != null && medication.pharmacyName!.isNotEmpty)
          'Pharmacy ${medication.pharmacyName}',
      ].join('. ');

  static String _stockMessage(Medication medication) {
    final int? days = medication.daysRemaining;
    if (days == null) return 'Running low. Check how much is left.';
    if (days <= 0) return 'No stock left. Time to refill.';
    return 'Running low — about $days ${days == 1 ? 'day' : 'days'} left. Time to refill.';
  }
}
