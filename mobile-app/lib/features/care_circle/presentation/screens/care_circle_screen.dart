import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_sizes.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../../../core/widgets/screen_scaffold.dart';
import '../../../../core/widgets/section_card.dart';
import '../../domain/entities/care_circle_details.dart';
import '../bloc/care_circle_bloc.dart';
import '../bloc/care_circle_event.dart';
import '../bloc/care_circle_state.dart';

/// "Who can see my information" — always available to the senior (PRD §5.3).
class CareCircleScreen extends StatefulWidget {
  const CareCircleScreen({super.key});

  @override
  State<CareCircleScreen> createState() => _CareCircleScreenState();
}

class _CareCircleScreenState extends State<CareCircleScreen> {
  @override
  void initState() {
    super.initState();
    context.read<CareCircleBloc>().add(const CareCircleRequested());
  }

  @override
  Widget build(BuildContext context) {
    final CareCircleState state = context.watch<CareCircleBloc>().state;
    final CareCircleDetails? details = state.details;

    return ScreenScaffold(
      title: 'My care circle',
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
              const LoadingView(label: 'Loading your care circle')
            else if (state.hasFailed)
              ErrorRetryView(
                message: state.message ?? 'We could not load your care circle.',
                onRetry: () =>
                    context.read<CareCircleBloc>().add(const CareCircleRefreshed()),
              )
            else if (details != null) ...<Widget>[
              SectionCard(
                title: details.name,
                child: Text(
                  'Everyone listed here can see your medicines and appointments, '
                  'and can mark a dose as taken.',
                  style: Theme.of(context).textTheme.bodyLarge,
                  softWrap: true,
                  maxLines: null,
                ),
              ),
              const SizedBox(height: AppSizes.gapLarge),
              SectionCard(
                title: details.members.isEmpty
                    ? 'People'
                    : '${details.members.length} ${details.members.length == 1 ? 'person' : 'people'}',
                child: Column(
                  children: <Widget>[
                    for (final CareCircleMember member in details.members)
                      Semantics(
                        container: true,
                        label: '${member.name}. ${member.role.label}.',
                        child: ExcludeSemantics(
                          child: ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: CircleAvatar(
                              backgroundColor:
                                  Theme.of(context).colorScheme.primaryContainer,
                              child: Text(
                                _initial(member.name),
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                            ),
                            title: Text(
                              member.name,
                              style: Theme.of(context).textTheme.titleMedium,
                              softWrap: true,
                              maxLines: null,
                            ),
                            subtitle: Text(
                              member.role.label,
                              style: Theme.of(context).textTheme.bodyLarge,
                              softWrap: true,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _initial(String name) {
    final String trimmed = name.trim();
    return trimmed.isEmpty ? '?' : trimmed.substring(0, 1).toUpperCase();
  }

  Future<void> _refresh() async {
    final CareCircleBloc bloc = context.read<CareCircleBloc>();
    bloc.add(const CareCircleRefreshed());
    await bloc.stream.firstWhere(
      (CareCircleState state) => state.status != CareCircleStatus.loading,
    );
  }
}
