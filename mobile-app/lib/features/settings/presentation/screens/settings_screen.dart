import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/config/app_config.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_sizes.dart';
import '../../../../core/widgets/accessible_button.dart';
import '../../../../core/widgets/screen_scaffold.dart';
import '../../../../core/widgets/section_card.dart';
import '../../../auth/domain/entities/care_circle.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../bloc/settings_bloc.dart';
import '../bloc/settings_event.dart';
import '../bloc/settings_state.dart';

/// Accessibility settings (PRD §9): text size, contrast, spoken confirmations.
class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  static const double _large = 1.3;
  static const double _extraLarge = 1.6;
  static const double _largest = 2;

  @override
  Widget build(BuildContext context) {
    final SettingsState settings = context.watch<SettingsBloc>().state;
    final AuthState auth = context.watch<AuthBloc>().state;
    final ThemeData theme = Theme.of(context);

    return ScreenScaffold(
      title: 'Accessibility',
      leading: IconButton(
        icon: const Icon(Icons.home_outlined),
        tooltip: 'Back to today',
        onPressed: () => context.go(AppRoutes.home),
      ),
      child: ListView(
        padding: EdgeInsets.zero,
        children: <Widget>[
          SectionCard(
            title: 'Text size',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Follow your phone or pick a size for this app.',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  softWrap: true,
                  maxLines: null,
                ),
                const SizedBox(height: AppSizes.gap),
                RadioGroup<double?>(
                  groupValue: settings.textScaleOverride,
                  onChanged: (double? value) => context
                      .read<SettingsBloc>()
                      .add(SettingsTextScaleChanged(value)),
                  child: Column(
                    children: <Widget>[
                      _option(context, value: null, label: 'Follow my phone'),
                      _option(context, value: _large, label: 'Large'),
                      _option(context, value: _extraLarge, label: 'Extra large'),
                      _option(context, value: _largest, label: 'Largest'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSizes.gapLarge),
          SectionCard(
            title: 'Contrast and voice',
            child: Column(
              children: <Widget>[
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: settings.highContrast,
                  onChanged: (bool value) => context
                      .read<SettingsBloc>()
                      .add(SettingsHighContrastToggled(value)),
                  title: Text(
                    'Higher contrast colours',
                    style: theme.textTheme.bodyLarge,
                    softWrap: true,
                  ),
                  subtitle: Text(
                    'Darker text and stronger outlines on every screen.',
                    style: theme.textTheme.bodyMedium,
                    softWrap: true,
                  ),
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: settings.announceActions,
                  onChanged: (bool value) => context
                      .read<SettingsBloc>()
                      .add(SettingsAnnounceActionsToggled(value)),
                  title: Text(
                    'Speak confirmations',
                    style: theme.textTheme.bodyLarge,
                    softWrap: true,
                  ),
                  subtitle: Text(
                    'Your screen reader says short confirmations, like “Dose marked as taken”, '
                    'when your phone supports it. Everything also appears on screen.',
                    style: theme.textTheme.bodyMedium,
                    softWrap: true,
                    maxLines: null,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSizes.gapLarge),
          SectionCard(
            title: 'Your account',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  auth.user?.name ?? 'Signed in',
                  style: theme.textTheme.titleMedium,
                  softWrap: true,
                  maxLines: null,
                ),
                const SizedBox(height: AppSizes.gap / 2),
                Text(
                  auth.user?.email ?? '',
                  style: theme.textTheme.bodyLarge,
                  softWrap: true,
                  maxLines: null,
                ),
                if (auth.careCircles.length > 1) ...<Widget>[
                  const SizedBox(height: AppSizes.gapLarge),
                  Semantics(
                    header: true,
                    child: Text('Care circle', style: theme.textTheme.titleMedium),
                  ),
                  const SizedBox(height: AppSizes.gap),
                  Wrap(
                    spacing: AppSizes.gap,
                    runSpacing: AppSizes.gap,
                    children: <Widget>[
                      for (final CareCircle circle in auth.careCircles)
                        AccessibleButton(
                          label: circle.name,
                          icon: circle.id == auth.activeCareCircle?.id
                              ? Icons.check_circle
                              : Icons.diversity_3_outlined,
                          filled: circle.id == auth.activeCareCircle?.id,
                          minHeight: AppSizes.secondaryButtonHeight,
                          onPressed: () => context
                              .read<AuthBloc>()
                              .add(AuthCareCircleSelected(circle.id)),
                          semanticsLabel: circle.id == auth.activeCareCircle?.id
                              ? '${circle.name}, currently shown'
                              : 'Show ${circle.name}',
                        ),
                    ],
                  ),
                ],
                const SizedBox(height: AppSizes.gapLarge),
                AccessibleButton(
                  label: 'Sign out',
                  icon: Icons.logout,
                  filled: false,
                  expand: true,
                  onPressed: () =>
                      context.read<AuthBloc>().add(const AuthLogoutRequested()),
                  semanticsHint: 'Signs you out on this phone',
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSizes.gapLarge),
          Text(
            '${AppConfig.appName} reminders and coordination only — it never gives '
            'medical advice.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            softWrap: true,
            maxLines: null,
          ),
        ],
      ),
    );
  }

  Widget _option(
    BuildContext context, {
    required double? value,
    required String label,
  }) {
    final ThemeData theme = Theme.of(context);
    return RadioListTile<double?>(
      value: value,
      contentPadding: EdgeInsets.zero,
      title: Text(label, style: theme.textTheme.bodyLarge, softWrap: true),
    );
  }
}
