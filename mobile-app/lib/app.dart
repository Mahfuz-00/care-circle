import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import '../core/accessibility/announcer.dart';
import '../core/config/app_config.dart';
import '../core/di/injection.dart';
import '../core/router/app_router.dart';
import '../core/theme/app_theme.dart';
import '../features/settings/presentation/bloc/settings_bloc.dart';
import '../features/settings/presentation/bloc/settings_state.dart';

/// Root widget: Warm Sage theme, accessibility preferences, and the router.
class CareCircleApp extends StatelessWidget {
  const CareCircleApp({super.key});

  static const List<Locale> supportedLocales = <Locale>[Locale('en')];

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SettingsBloc, SettingsState>(
      builder: (BuildContext context, SettingsState settings) => MaterialApp.router(
        title: AppConfig.appName,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        localizationsDelegates: const <LocalizationsDelegate<Object>>[
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: supportedLocales,
        routerConfig: sl<AppRouter>().router,
        builder: (BuildContext context, Widget? child) => _AccessibilityShell(
          settings: settings,
          child: child,
        ),
      ),
    );
  }
}

/// Applies the accessibility choices to the whole app (PRD §9):
/// * the OS text scale is respected and clamped to a still-usable maximum;
/// * a chosen size overrides the OS one;
/// * high contrast re-colours every screen;
/// * the announcer follows the "speak confirmations" preference.
class _AccessibilityShell extends StatelessWidget {
  const _AccessibilityShell({required this.settings, required this.child});

  final SettingsState settings;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final MediaQueryData media = MediaQuery.of(context);
    final double? override = settings.textScaleOverride;
    final TextScaler scaler = override == null
        ? media.textScaler.clamp(
            minScaleFactor: 0.8,
            maxScaleFactor: 3,
          )
        : TextScaler.linear(override);

    final bool highContrast = settings.highContrast || media.highContrast;

    return AnnouncerScope(
      announcer: Announcer(enabled: settings.announceActions),
      child: Theme(
        data: AppTheme.light(highContrast: highContrast),
        child: MediaQuery(
          data: media.copyWith(
            textScaler: scaler,
            boldText: media.boldText || highContrast,
          ),
          child: child ?? const SizedBox.shrink(),
        ),
      ),
    );
  }
}
