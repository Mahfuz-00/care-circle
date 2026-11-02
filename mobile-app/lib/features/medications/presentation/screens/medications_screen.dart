import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/actions/phone_actions.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_sizes.dart';
import '../../../../core/widgets/empty_state_view.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../../../core/widgets/message_banner.dart';
import '../../../../core/widgets/screen_scaffold.dart';
import '../../domain/entities/medication.dart';
import '../bloc/medications_bloc.dart';
import '../bloc/medications_event.dart';
import '../bloc/medications_state.dart';
import '../widgets/medication_list_card.dart';

/// Every medication in the care circle.
class MedicationsScreen extends StatefulWidget {
  const MedicationsScreen({this.phoneActions = const PhoneActions(), super.key});

  final PhoneActions phoneActions;

  @override
  State<MedicationsScreen> createState() => _MedicationsScreenState();
}

class _MedicationsScreenState extends State<MedicationsScreen> {
  @override
  void initState() {
    super.initState();
    context.read<MedicationsBloc>().add(const MedicationsRequested());
  }

  @override
  Widget build(BuildContext context) {
    final MedicationsState state = context.watch<MedicationsBloc>().state;

    return ScreenScaffold(
      title: 'My medicines',
      leading: IconButton(
        icon: const Icon(Icons.home_outlined),
        tooltip: 'Back to today',
        onPressed: () => context.go(AppRoutes.home),
      ),
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          padding: EdgeInsets.zero,
          children: <Widget>[
            if (state.isLoading)
              const LoadingView(label: 'Loading your medicines')
            else if (state.hasFailed)
              ErrorRetryView(
                message: state.message ?? 'We could not load your medicines.',
                onRetry: () =>
                    context.read<MedicationsBloc>().add(const MedicationsRefreshed()),
              )
            else ..._list(state),
          ],
        ),
      ),
    );
  }

  List<Widget> _list(MedicationsState state) {
    if (state.medications.isEmpty) {
      return <Widget>[
        const EmptyStateView(
          title: 'No medicines yet',
          message: 'Medicines added to this care circle will appear here.',
          icon: Icons.medication_outlined,
        ),
      ];
    }

    return <Widget>[
      if (state.lowStock.isNotEmpty) ...<Widget>[
        MessageBanner(
          message: state.lowStock.length == 1
              ? '1 medicine is running low.'
              : '${state.lowStock.length} medicines are running low.',
          tone: MessageBannerTone.warning,
        ),
        const SizedBox(height: AppSizes.gapLarge),
      ],
      for (final Medication medication in state.medications)
        Padding(
          padding: const EdgeInsets.only(bottom: AppSizes.gapLarge),
          child: MedicationListCard(
            medication: medication,
            phoneActions: widget.phoneActions,
            onOpen: () => context.push(AppRoutes.medicationDetail(medication.id)),
          ),
        ),
    ];
  }

  Future<void> _refresh() async {
    final MedicationsBloc bloc = context.read<MedicationsBloc>();
    bloc.add(const MedicationsRefreshed());
    await bloc.stream.firstWhere(
      (MedicationsState state) => state.status != MedicationsStatus.loading,
    );
  }
}
