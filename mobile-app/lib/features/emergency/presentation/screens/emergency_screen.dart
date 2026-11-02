import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/accessibility/announcer.dart';
import '../../../../core/actions/phone_actions.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_sizes.dart';
import '../../../../core/utils/date_formatting.dart';
import '../../../../core/widgets/accessible_button.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../../../core/widgets/message_banner.dart';
import '../../../../core/widgets/screen_scaffold.dart';
import '../../../../core/widgets/section_card.dart';
import '../../../care_circle/presentation/bloc/care_circle_bloc.dart';
import '../../../care_circle/presentation/bloc/care_circle_event.dart';
import '../../../care_circle/presentation/bloc/care_circle_state.dart';
import '../../domain/entities/emergency_alert.dart';
import '../bloc/emergency_bloc.dart';
import '../bloc/emergency_event.dart';
import '../bloc/emergency_state.dart';
import '../widgets/emergency_help_button.dart';

/// Raising and following up an emergency (PRD §5.5, PRD §13).
///
/// Reached two ways: the big button on Today (which raises immediately), or the
/// "choose an emergency type" entry, which lets the senior say what happened in
/// one extra deliberate press.
class EmergencyScreen extends StatefulWidget {
  const EmergencyScreen({
    this.phoneActions = const PhoneActions(),
    this.announcer,
    super.key,
  });

  final PhoneActions phoneActions;

  /// `null` means "use the settings-aware announcer from [AnnouncerScope]".
  final Announcer? announcer;

  @override
  State<EmergencyScreen> createState() => _EmergencyScreenState();
}

class _EmergencyScreenState extends State<EmergencyScreen> {
  Announcer get _announcer => widget.announcer ?? AnnouncerScope.of(context);

  @override
  void initState() {
    super.initState();
    final EmergencyBloc emergency = context.read<EmergencyBloc>();
    if (emergency.state.hasAlert) {
      emergency.add(const EmergencyAlertRequested());
    }
    context.read<CareCircleBloc>().add(const CareCircleRequested());
  }

  @override
  Widget build(BuildContext context) {
    final EmergencyState state = context.watch<EmergencyBloc>().state;

    return BlocListener<EmergencyBloc, EmergencyState>(
      listenWhen: (EmergencyState? previous, EmergencyState current) =>
          current.message != null && previous?.message != current.message,
      listener: (BuildContext context, EmergencyState state) =>
          _announcer.announce(context, state.message!),
      child: ScreenScaffold(
        title: state.hasAlert ? 'Help' : 'Get help now',
        leading: IconButton(
          icon: const Icon(Icons.home_outlined),
          tooltip: 'Back to today',
          onPressed: () => context.go(AppRoutes.home),
        ),
        child: ListView(
          padding: EdgeInsets.zero,
          children: <Widget>[
            if (state.message != null) ...<Widget>[
              MessageBanner(
                message: state.message!,
                tone: state.messageIsError
                    ? MessageBannerTone.error
                    : MessageBannerTone.success,
              ),
              const SizedBox(height: AppSizes.gapLarge),
            ],
            if (state.isRaising)
              const LoadingView(label: 'Telling your care circle you need help')
            else if (state.hasAlert)
              _status(state)
            else
              _chooser(state),
          ],
        ),
      ),
    );
  }

  Widget _chooser(EmergencyState state) {
    final ThemeData theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Semantics(
          header: true,
          child: Text(
            'What is happening?',
            style: theme.textTheme.headlineSmall,
            softWrap: true,
            maxLines: null,
          ),
        ),
        const SizedBox(height: AppSizes.gap),
        Text(
          'Choosing tells everyone in your care circle. You can also call '
          '${EmergencyHelpButton.emergencyNumber} on your phone.',
          style: theme.textTheme.bodyLarge?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
          softWrap: true,
          maxLines: null,
        ),
        const SizedBox(height: AppSizes.gapLarge),
        for (final EmergencyType type in EmergencyType.values)
          Padding(
            padding: const EdgeInsets.only(bottom: AppSizes.gap),
            child: AccessibleButton(
              label: type.label,
              icon: Icons.emergency_outlined,
              expand: true,
              minHeight: AppSizes.primaryButtonHeight,
              isDestructive: true,
              onPressed: () => context
                  .read<EmergencyBloc>()
                  .add(EmergencyRaiseRequested(type: type)),
              semanticsLabel: '${type.label}. Sends an emergency alert.',
              semanticsHint: 'Press once. Your care circle is told straight away.',
            ),
          ),
        const SizedBox(height: AppSizes.gap),
        AccessibleButton(
          label: 'Call ${EmergencyHelpButton.emergencyNumber} by phone',
          icon: Icons.phone,
          filled: false,
          expand: true,
          onPressed: () =>
              widget.phoneActions.call(EmergencyHelpButton.emergencyNumber),
          semanticsHint: 'Opens your phone app to dial this number',
        ),
      ],
    );
  }

  Widget _status(EmergencyState state) {
    final ThemeData theme = Theme.of(context);
    final EmergencyAlert alert = state.alert!;
    final CareCircleState circle = context.watch<CareCircleBloc>().state;
    final int memberCount = circle.details?.members.length ?? 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Semantics(
          header: true,
          child: Text(
            alert.isAcknowledged ? 'Someone is coming' : 'Help is on the way',
            style: theme.textTheme.headlineMedium,
            softWrap: true,
            maxLines: null,
          ),
        ),
        const SizedBox(height: AppSizes.gap),
        Text(
          alert.isAcknowledged
              ? '${alert.acknowledgedBy?.name ?? 'Your care circle'} has seen your alert.'
              : 'Your care circle has your alert. Someone will answer it soon.',
          style: theme.textTheme.bodyLarge,
          softWrap: true,
          maxLines: null,
        ),
        const SizedBox(height: AppSizes.gapLarge),
        SectionCard(
          title: 'What you told them',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                alert.type.label,
                style: theme.textTheme.bodyLarge,
                softWrap: true,
                maxLines: null,
              ),
              const SizedBox(height: AppSizes.gap / 2),
              Text(
                'Raised at ${DateFormatting.time(alert.createdAt)}',
                style: theme.textTheme.bodyLarge,
                softWrap: true,
                maxLines: null,
              ),
              const SizedBox(height: AppSizes.gap / 2),
              Text(
                memberCount > 0
                    ? '$memberCount ${memberCount == 1 ? 'person' : 'people'} in your care circle were told.'
                    : 'Everyone in your care circle was told.',
                style: theme.textTheme.bodyLarge,
                softWrap: true,
                maxLines: null,
              ),
              if (alert.acknowledgedAt != null) ...<Widget>[
                const SizedBox(height: AppSizes.gap / 2),
                Text(
                  'Answered at ${DateFormatting.time(alert.acknowledgedAt!)}',
                  style: theme.textTheme.bodyLarge,
                  softWrap: true,
                  maxLines: null,
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: AppSizes.gapLarge),
        AccessibleButton(
          label: 'Call ${EmergencyHelpButton.emergencyNumber} by phone',
          icon: Icons.phone,
          expand: true,
          minHeight: AppSizes.primaryButtonHeight,
          isDestructive: true,
          onPressed: () =>
              widget.phoneActions.call(EmergencyHelpButton.emergencyNumber),
          semanticsHint: 'Opens your phone app to dial this number',
        ),
        const SizedBox(height: AppSizes.gap),
        AccessibleButton(
          label: 'Check for an answer',
          icon: Icons.refresh,
          filled: false,
          expand: true,
          busy: state.refreshing,
          onPressed: state.refreshing
              ? null
              : () => context.read<EmergencyBloc>().add(const EmergencyAlertRequested()),
          semanticsHint: 'Asks CareCircle whether someone has answered',
        ),
        if (!alert.isAcknowledged) ...<Widget>[
          const SizedBox(height: AppSizes.gap),
          AccessibleButton(
            label: 'Someone has reached me',
            icon: Icons.handshake_outlined,
            filled: false,
            expand: true,
            busy: state.busy,
            onPressed: state.busy
                ? null
                : () => context
                    .read<EmergencyBloc>()
                    .add(const EmergencyAcknowledgeRequested()),
            semanticsHint: 'Records that you have been helped',
          ),
        ],
        const SizedBox(height: AppSizes.gap),
        AccessibleButton(
          label: 'Back to today',
          icon: Icons.home_outlined,
          filled: false,
          expand: true,
          onPressed: () => context.go(AppRoutes.home),
        ),
      ],
    );
  }
}
