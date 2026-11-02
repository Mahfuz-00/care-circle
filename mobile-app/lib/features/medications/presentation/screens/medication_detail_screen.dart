import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/actions/phone_actions.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_sizes.dart';
import '../../../../core/widgets/accessible_button.dart';
import '../../../../core/widgets/empty_state_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../../../core/widgets/medication_name_text.dart';
import '../../../../core/widgets/message_banner.dart';
import '../../../../core/widgets/screen_scaffold.dart';
import '../../../../core/widgets/section_card.dart';
import '../../../home/presentation/bloc/today_bloc.dart';
import '../../../home/presentation/bloc/today_event.dart';
import '../../../home/presentation/bloc/today_state.dart';
import '../../domain/entities/dose.dart';
import '../../domain/entities/medication.dart';
import '../bloc/medications_bloc.dart';
import '../bloc/medications_event.dart';
import '../bloc/medications_state.dart';
import '../widgets/dose_card.dart';
import '../widgets/skip_reason_sheet.dart';
import '../widgets/snooze_dialog.dart';

/// Everything about one medication, plus today's doses for it.
///
/// Today's doses are owned by `TodayBloc` — it is the single writer for the
/// dose state machine (one tap from home, from here, or from a notification
/// action all land in the same place).
class MedicationDetailScreen extends StatefulWidget {
  const MedicationDetailScreen({
    required this.medicationId,
    this.phoneActions = const PhoneActions(),
    super.key,
  });

  final String medicationId;
  final PhoneActions phoneActions;

  @override
  State<MedicationDetailScreen> createState() => _MedicationDetailScreenState();
}

class _MedicationDetailScreenState extends State<MedicationDetailScreen> {
  @override
  void initState() {
    super.initState();
    final MedicationsBloc bloc = context.read<MedicationsBloc>();
    if (bloc.state.medications.isEmpty) {
      bloc.add(const MedicationsRequested());
    }
    final TodayBloc today = context.read<TodayBloc>();
    if (today.state.summary == null) {
      today.add(const TodayRequested());
    }
  }

  @override
  Widget build(BuildContext context) {
    final MedicationsState medications = context.watch<MedicationsBloc>().state;
    final TodayState today = context.watch<TodayBloc>().state;
    final Medication? medication = medications.byId(widget.medicationId);

    if (medication == null) {
      return ScreenScaffold(
        title: 'Medicine',
        leading: _backButton(),
        child: medications.isLoading
            ? const LoadingView(label: 'Loading this medicine')
            : const EmptyStateView(
                title: 'We could not find this medicine',
                message: 'It may have been removed from your care circle.',
                icon: Icons.medication_outlined,
              ),
      );
    }

    final List<Dose> doses = today.summary?.doses
            .where((Dose dose) => dose.medication.id == medication.id)
            .toList(growable: false) ??
        const <Dose>[];

    return ScreenScaffold(
      title: 'Medicine',
      leading: _backButton(),
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          padding: EdgeInsets.zero,
          children: <Widget>[
            MedicationNameText(medication.name, style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: AppSizes.gap / 2),
            Text(
              medication.dosage,
              style: Theme.of(context).textTheme.titleMedium,
              softWrap: true,
              maxLines: null,
            ),
            const SizedBox(height: AppSizes.gapLarge),
            SectionCard(
              title: 'Schedule',
              child: _facts(medication),
            ),
            const SizedBox(height: AppSizes.gapLarge),
            SectionCard(
              title: 'Stock',
              child: _stock(medication),
            ),
            if (medication.hasPharmacyContact) ...<Widget>[
              const SizedBox(height: AppSizes.gapLarge),
              SectionCard(
                title: 'Pharmacy',
                child: _pharmacy(medication),
              ),
            ],
            const SizedBox(height: AppSizes.gapLarge),
            SectionCard(
              title: 'Today',
              child: _doses(today, doses),
            ),
            const SizedBox(height: AppSizes.gapLarge),
            Text(
              'CareCircle reminds you about this medicine and keeps the record for '
              'your care circle. Questions about your medicines belong with your '
              'pharmacist or doctor.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
              softWrap: true,
              maxLines: null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _backButton() => IconButton(
        icon: const Icon(Icons.arrow_back),
        tooltip: 'Back',
        onPressed: () => context.canPop() ? context.pop() : context.go(AppRoutes.home),
      );

  Widget _facts(Medication medication) {
    final ThemeData theme = Theme.of(context);

    return Semantics(
      container: true,
      label: <String>[
        medication.scheduleSummary,
        if (medication.withFood) 'with food',
      ].join('. '),
      child: ExcludeSemantics(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              medication.scheduleSummary,
              style: theme.textTheme.bodyLarge,
              softWrap: true,
              maxLines: null,
            ),
            if (medication.times.isNotEmpty) ...<Widget>[
              const SizedBox(height: AppSizes.gap / 2),
              Text(
                'Reminder times: ${medication.times.join(', ')}',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                softWrap: true,
                maxLines: null,
              ),
            ],
            if (medication.withFood) ...<Widget>[
              const SizedBox(height: AppSizes.gap / 2),
              Text(
                'With food',
                style: theme.textTheme.bodyLarge,
                softWrap: true,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _stock(Medication medication) {
    final ThemeData theme = Theme.of(context);
    final int? days = medication.daysRemaining;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        if (medication.isRunningLow)
          MessageBanner(
            message: days == null
                ? 'Running low. Check how much is left.'
                : 'Running low — about $days ${days == 1 ? 'day' : 'days'} left.',
            tone: MessageBannerTone.warning,
          )
        else
          Text(
            days == null
                ? 'Stock is not tracked for this medicine yet.'
                : 'About $days ${days == 1 ? 'day' : 'days'} of stock left.',
            style: theme.textTheme.bodyLarge,
            softWrap: true,
            maxLines: null,
          ),
      ],
    );
  }

  Widget _pharmacy(Medication medication) {
    final ThemeData theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        if (medication.pharmacyName != null && medication.pharmacyName!.isNotEmpty)
          Semantics(
            header: false,
            child: Text(
              medication.pharmacyName!,
              style: theme.textTheme.titleMedium,
              softWrap: true,
              maxLines: null,
            ),
          ),
        if (medication.pharmacyPhone != null && medication.pharmacyPhone!.isNotEmpty) ...<Widget>[
          const SizedBox(height: AppSizes.gap / 2),
          Text(
            medication.pharmacyPhone!,
            style: theme.textTheme.bodyLarge,
            softWrap: true,
          ),
          const SizedBox(height: AppSizes.gap),
          Wrap(
            spacing: AppSizes.gap,
            runSpacing: AppSizes.gap,
            children: <Widget>[
              AccessibleButton(
                label: 'Call pharmacy',
                icon: Icons.phone,
                onPressed: () => widget.phoneActions.call(medication.pharmacyPhone!),
                semanticsLabel: 'Call the pharmacy about ${medication.name}',
                semanticsHint: 'Opens your phone app and dials the pharmacy',
              ),
              AccessibleButton(
                label: 'Text pharmacy',
                icon: Icons.sms_outlined,
                filled: false,
                onPressed: () => widget.phoneActions.sendSms(
                  medication.pharmacyPhone!,
                  body: 'Hello, I would like to order more of ${medication.name}.',
                ),
                semanticsLabel: 'Text the pharmacy about ${medication.name}',
                semanticsHint: 'Opens your messaging app',
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _doses(TodayState today, List<Dose> doses) {
    if (doses.isEmpty) {
      return const EmptyStateView(
        title: 'No doses today',
        message: 'Nothing is scheduled for this medicine today.',
        icon: Icons.event_available_outlined,
      );
    }

    return Column(
      children: <Widget>[
        for (final Dose dose in doses)
          Padding(
            padding: const EdgeInsets.only(bottom: AppSizes.gap),
            child: DoseCard(
              dose: dose,
              busy: today.isDoseBusy(dose.id),
              onTake: () =>
                  context.read<TodayBloc>().add(TodayTakeDoseRequested(doseId: dose.id)),
              onSkip: () => _skip(dose),
              onSnooze: () => _snooze(dose),
            ),
          ),
      ],
    );
  }

  Future<void> _skip(Dose dose) async {
    final SkipReasonOutcome? outcome = await showSkipReasonSheet(
      context,
      medicationName: dose.medication.name,
    );
    if (!mounted || outcome == null) return;
    context
        .read<TodayBloc>()
        .add(TodaySkipDoseRequested(doseId: dose.id, reason: outcome.reason));
  }

  Future<void> _snooze(Dose dose) async {
    final int? minutes = await showSnoozeDialog(
      context,
      medicationName: dose.medication.name,
    );
    if (!mounted || minutes == null) return;
    context
        .read<TodayBloc>()
        .add(TodaySnoozeDoseRequested(doseId: dose.id, minutes: minutes));
  }

  Future<void> _refresh() async {
    context.read<MedicationsBloc>().add(const MedicationsRefreshed());
    context.read<TodayBloc>().add(const TodayRefreshed());
    await Future<void>.delayed(const Duration(milliseconds: 300));
  }
}
