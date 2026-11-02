import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_sizes.dart';
import '../../../../core/widgets/empty_state_view.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../../../core/widgets/screen_scaffold.dart';
import '../../domain/entities/appointment.dart';
import '../bloc/appointments_bloc.dart';
import '../bloc/appointments_event.dart';
import '../bloc/appointments_state.dart';
import '../widgets/appointment_card.dart';

/// Upcoming doctors, labs and procedures (PRD §5.4).
class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  @override
  void initState() {
    super.initState();
    context.read<AppointmentsBloc>().add(const AppointmentsRequested());
  }

  @override
  Widget build(BuildContext context) {
    final AppointmentsState state = context.watch<AppointmentsBloc>().state;

    return ScreenScaffold(
      title: 'Appointments',
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
              const LoadingView(label: 'Loading your appointments')
            else if (state.hasFailed)
              ErrorRetryView(
                message: state.message ?? 'We could not load your appointments.',
                onRetry: () =>
                    context.read<AppointmentsBloc>().add(const AppointmentsRefreshed()),
              )
            else if (state.appointments.isEmpty)
              const EmptyStateView(
                title: 'No appointments booked',
                message: 'Upcoming visits will be listed here with their date and place.',
                icon: Icons.event_available_outlined,
              )
            else
              for (final Appointment appointment in state.appointments)
                Padding(
                  padding: const EdgeInsets.only(bottom: AppSizes.gapLarge),
                  child: AppointmentCard(appointment: appointment),
                ),
          ],
        ),
      ),
    );
  }

  Future<void> _refresh() async {
    final AppointmentsBloc bloc = context.read<AppointmentsBloc>();
    bloc.add(const AppointmentsRefreshed());
    await bloc.stream.firstWhere(
      (AppointmentsState state) => state.status != AppointmentsStatus.loading,
    );
  }
}
