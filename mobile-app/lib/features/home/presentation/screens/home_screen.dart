import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/accessibility/announcer.dart';
import '../../../../core/actions/phone_actions.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_sizes.dart';
import '../../../../core/utils/date_formatting.dart';
import '../../../../core/widgets/accessible_button.dart';
import '../../../../core/widgets/empty_state_view.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../../../core/widgets/message_banner.dart';
import '../../../../core/widgets/section_card.dart';
import '../../../appointments/domain/entities/appointment.dart';
import '../../../appointments/presentation/widgets/appointment_card.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../emergency/domain/entities/emergency_alert.dart';
import '../../../emergency/presentation/bloc/emergency_bloc.dart';
import '../../../emergency/presentation/bloc/emergency_event.dart';
import '../../../emergency/presentation/bloc/emergency_state.dart';
import '../../../emergency/presentation/widgets/emergency_help_button.dart';
import '../../../medications/domain/entities/dose.dart';
import '../../../medications/presentation/widgets/dose_card.dart';
import '../../../medications/presentation/widgets/skip_reason_sheet.dart';
import '../../../medications/presentation/widgets/snooze_dialog.dart';
import '../../domain/entities/today_summary.dart';
import '../bloc/today_bloc.dart';
import '../bloc/today_event.dart';
import '../bloc/today_state.dart';

/// Today: the emergency button (always pinned), today's medicines with the
/// one-tap dose actions, today's visits, and big entry points to everything
/// else (PRD §5.1, §5.4, §5.5).
class HomeScreen extends StatefulWidget {
  const HomeScreen({
    this.announcer,
    this.phoneActions = const PhoneActions(),
    super.key,
  });

  /// `null` means "use the settings-aware announcer from [AnnouncerScope]".
  final Announcer? announcer;

  final PhoneActions phoneActions;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  /// Last plan read aloud, shown on screen too (same information, every
  /// channel).
  String? _spokenPlan;

  Announcer get _announcer => widget.announcer ?? AnnouncerScope.of(context);

  @override
  void initState() {
    super.initState();
    context.read<TodayBloc>().add(const TodayRequested());
  }

  @override
  Widget build(BuildContext context) {
    final AuthState auth = context.watch<AuthBloc>().state;
    final TodayState today = context.watch<TodayBloc>().state;
    final EmergencyState emergency = context.watch<EmergencyBloc>().state;
    final TodaySummary? summary = today.summary;

    return BlocListener<AuthBloc, AuthState>(
      // Switching care circle reloads Today; nobody has to refresh by hand.
      listenWhen: (AuthState? previous, AuthState current) =>
          previous?.activeCareCircle?.id != current.activeCareCircle?.id,
      listener: (BuildContext context, AuthState state) =>
          context.read<TodayBloc>().add(const TodayRequested()),
      child: BlocListener<TodayBloc, TodayState>(
        listenWhen: (TodayState? previous, TodayState current) =>
            current.message != null && previous?.message != current.message,
        listener: (BuildContext context, TodayState state) =>
            _announcer.announce(context, state.message!),
        child: Scaffold(
          appBar: AppBar(
            title: Semantics(
              header: true,
              child: Text(_greeting(auth)),
            ),
            actions: <Widget>[
              IconButton(
                icon: const Icon(Icons.settings_accessibility),
                tooltip: 'Accessibility settings',
                onPressed: () => context.push(AppRoutes.settings),
              ),
              IconButton(
                icon: const Icon(Icons.logout),
                tooltip: 'Sign out',
                onPressed: () =>
                    context.read<AuthBloc>().add(const AuthLogoutRequested()),
              ),
            ],
          ),
          body: SafeArea(
            top: false,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                _EmergencySection(
                  busy: emergency.isRaising,
                  onRaise: _raiseEmergency,
                  onCall: _callEmergencyNumber,
                ),
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: _refresh,
                    child: ListView(
                      padding: const EdgeInsets.fromLTRB(
                        AppSizes.screenPadding,
                        AppSizes.gap,
                        AppSizes.screenPadding,
                        AppSizes.screenPadding + 8,
                      ),
                      children: <Widget>[
                        if (today.message != null && summary != null) ...<Widget>[
                          MessageBanner(
                            message: today.message!,
                            tone: today.messageIsError
                                ? MessageBannerTone.error
                                : MessageBannerTone.success,
                          ),
                          const SizedBox(height: AppSizes.gap),
                        ],
                        if (_spokenPlan != null) ...<Widget>[
                          MessageBanner(message: _spokenPlan!),
                          const SizedBox(height: AppSizes.gap),
                        ],
                        ..._content(today),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> _content(TodayState today) {
    final TodaySummary? summary = today.summary;

    if (summary == null) {
      if (today.hasFailed) {
        return <Widget>[
          ErrorRetryView(
            message: today.message ?? 'We could not load your day.',
            onRetry: () => context.read<TodayBloc>().add(const TodayRefreshed()),
          ),
        ];
      }
      return const <Widget>[LoadingView(label: 'Loading your day')];
    }

    return <Widget>[
      if (summary.unreadAlerts > 0) ...<Widget>[
        MessageBanner(
          message: summary.unreadAlerts == 1
              ? 'You have 1 new update from your care circle.'
              : 'You have ${summary.unreadAlerts} new updates from your care circle.',
        ),
        const SizedBox(height: AppSizes.gap),
      ],
      Padding(
        padding: const EdgeInsets.only(bottom: AppSizes.gap),
        child: Semantics(
          header: true,
          child: Text(
            DateFormatting.day(DateTime.now()),
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
            softWrap: true,
            maxLines: null,
          ),
        ),
      ),
      SectionCard(
        title: 'Medicines due today',
        child: _doses(today, summary),
      ),
      const SizedBox(height: AppSizes.gapLarge),
      SectionCard(
        title: 'Visits today',
        child: _appointments(summary),
      ),
      const SizedBox(height: AppSizes.gapLarge),
      AccessibleButton(
        label: 'Hear today’s plan',
        icon: Icons.volume_up_outlined,
        filled: false,
        expand: true,
        onPressed: () => _speakPlan(summary),
        semanticsHint: 'Reads your medicines and visits for today aloud',
      ),
      const SizedBox(height: AppSizes.gapLarge),
      SectionCard(
        title: 'Where to next',
        child: Column(
          children: <Widget>[
            _NavTile(
              icon: Icons.medication_outlined,
              title: 'All my medicines',
              subtitle: 'Dosages, schedule, stock and pharmacy',
              onTap: () => context.push(AppRoutes.medications),
            ),
            _NavTile(
              icon: Icons.event_available_outlined,
              title: 'Appointments',
              subtitle: 'Doctors, labs and procedures',
              onTap: () => context.push(AppRoutes.appointments),
            ),
            _NavTile(
              icon: Icons.diversity_3_outlined,
              title: 'My care circle',
              subtitle: 'Everyone who can see your information',
              onTap: () => context.push(AppRoutes.careCircle),
            ),
            _NavTile(
              icon: Icons.emergency_outlined,
              title: 'Choose an emergency type',
              subtitle: 'Fall, heart attack, severe symptoms',
              onTap: () => context.push(AppRoutes.emergency),
            ),
          ],
        ),
      ),
      const SizedBox(height: AppSizes.gapLarge),
      Text(
        'CareCircle reminds you and keeps your care circle informed. '
        'It does not give medical advice.',
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
        softWrap: true,
        maxLines: null,
      ),
    ];
  }

  Widget _doses(TodayState today, TodaySummary summary) {
    if (summary.doses.isEmpty) {
      return const EmptyStateView(
        title: 'No medicines due today',
        message: 'CareCircle will remind you when the next dose is due.',
        icon: Icons.medication_outlined,
      );
    }

    return Column(
      children: <Widget>[
        for (final Dose dose in summary.doses)
          Padding(
            padding: const EdgeInsets.only(bottom: AppSizes.gap),
            child: DoseCard(
              dose: dose,
              busy: today.isDoseBusy(dose.id),
              onTake: () => _take(dose),
              onSkip: () => _skip(dose),
              onSnooze: () => _snooze(dose),
            ),
          ),
      ],
    );
  }

  Widget _appointments(TodaySummary summary) {
    if (summary.appointments.isEmpty) {
      return const EmptyStateView(
        title: 'No visits today',
        message: 'Your next appointment will show up here on the day.',
        icon: Icons.event_available_outlined,
      );
    }

    return Column(
      children: <Widget>[
        for (final Appointment appointment in summary.appointments)
          Padding(
            padding: const EdgeInsets.only(bottom: AppSizes.gap),
            child: AppointmentCard(appointment: appointment, showFullDate: false),
          ),
      ],
    );
  }

  String _greeting(AuthState auth) {
    final int hour = DateTime.now().hour;
    final String partOfDay = hour < 12
        ? 'Good morning'
        : hour < 18
            ? 'Good afternoon'
            : 'Good evening';
    final String name = auth.user?.greetingName ?? 'there';
    return '$partOfDay, $name';
  }

  Future<void> _refresh() async {
    final TodayBloc bloc = context.read<TodayBloc>();
    bloc.add(const TodayRefreshed());
    await bloc.stream.firstWhere((TodayState state) => !state.isRefreshing);
  }

  void _take(Dose dose) {
    context.read<TodayBloc>().add(TodayTakeDoseRequested(doseId: dose.id));
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

  /// One deliberate press: raise the alert and show its status straight away.
  void _raiseEmergency() {
    context
        .read<EmergencyBloc>()
        .add(const EmergencyRaiseRequested(type: EmergencyType.medical));
    _announcer.announce(
      context,
      'Sending an alert to your care circle.',
    );
    context.push(AppRoutes.emergency);
  }

  Future<void> _callEmergencyNumber() async {
    await widget.phoneActions.call(EmergencyHelpButton.emergencyNumber);
  }

  void _speakPlan(TodaySummary summary) {
    final String script = _planSentence(summary);
    setState(() => _spokenPlan = script);
    _announcer.announce(context, script);
  }

  String _planSentence(TodaySummary summary) {
    final int doses = summary.doses.length;
    final int visits = summary.appointments.length;
    final StringBuffer buffer = StringBuffer();
    buffer.write(
      doses == 0
          ? 'You have no doses today.'
          : 'You have $doses ${doses == 1 ? 'dose' : 'doses'} today.',
    );
    if (doses > 0) {
      final Dose first = summary.doses.first;
      buffer.write(
        ' The next one is ${first.medication.name} at '
        '${DateFormatting.time(first.scheduledFor)}.',
      );
    }
    buffer.write(
      visits == 0
          ? ' There are no visits today.'
          : ' You have $visits ${visits == 1 ? 'visit' : 'visits'} today, '
              'the first at ${DateFormatting.time(summary.appointments.first.startsAt)}.',
    );
    if (summary.unreadAlerts > 0) {
      buffer.write(
        ' You also have ${summary.unreadAlerts} '
        '${summary.unreadAlerts == 1 ? 'update' : 'updates'} from your care circle.',
      );
    }
    return buffer.toString();
  }
}

class _EmergencySection extends StatelessWidget {
  const _EmergencySection({
    required this.busy,
    required this.onRaise,
    required this.onCall,
  });

  final bool busy;
  final VoidCallback onRaise;
  final VoidCallback onCall;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSizes.screenPadding,
        0,
        AppSizes.screenPadding,
        AppSizes.gap,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          EmergencyHelpButton(onPressed: onRaise, busy: busy),
          const SizedBox(height: AppSizes.gap / 2),
          Text(
            'One press tells everyone in your care circle. '
            'You can also call ${EmergencyHelpButton.emergencyNumber} on your phone.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            softWrap: true,
            maxLines: null,
          ),
          const SizedBox(height: AppSizes.gap / 2),
          AccessibleButton(
            label: 'Call ${EmergencyHelpButton.emergencyNumber} by phone',
            icon: Icons.phone,
            filled: false,
            onPressed: onCall,
            minHeight: AppSizes.secondaryButtonHeight,
            semanticsHint: 'Opens your phone app to dial this number',
          ),
        ],
      ),
    );
  }
}

class _NavTile extends StatelessWidget {
  const _NavTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);

    return Semantics(
      button: true,
      label: '$title. $subtitle',
      child: ExcludeSemantics(
        child: ListTile(
          onTap: onTap,
          contentPadding: EdgeInsets.zero,
          leading: Icon(icon, size: 34, color: theme.colorScheme.primary),
          title: Text(title, style: theme.textTheme.titleMedium, softWrap: true),
          subtitle: Text(
            subtitle,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            softWrap: true,
            maxLines: null,
          ),
          trailing: const Icon(Icons.chevron_right),
        ),
      ),
    );
  }
}
