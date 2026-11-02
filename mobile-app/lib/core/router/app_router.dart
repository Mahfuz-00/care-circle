import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/appointments/presentation/screens/appointments_screen.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/auth/presentation/bloc/auth_state.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/care_circle/presentation/screens/care_circle_screen.dart';
import '../../features/emergency/presentation/screens/emergency_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/medications/presentation/screens/medication_detail_screen.dart';
import '../../features/medications/presentation/screens/medications_screen.dart';
import '../../features/settings/presentation/screens/settings_screen.dart';
import '../theme/app_sizes.dart';
import '../widgets/accessible_button.dart';

/// Every route in the app, in one place.
abstract final class AppRoutes {
  static const String splash = '/splash';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/';
  static const String medications = '/medications';
  static const String medicationDetailPath = '/medications/:id';
  static const String appointments = '/appointments';
  static const String careCircle = '/care-circle';
  static const String emergency = '/emergency';
  static const String settings = '/settings';

  static String medicationDetail(String id) => '/medications/$id';
}

/// Bridges [AuthBloc] to GoRouter so navigation reacts to sign-in/out.
class AuthRouterNotifier extends ChangeNotifier {
  AuthRouterNotifier(AuthBloc authBloc) : _authBloc = authBloc {
    _subscription = _authBloc.stream.listen((AuthState _) => notifyListeners());
  }

  final AuthBloc _authBloc;
  late final StreamSubscription<AuthState> _subscription;

  AuthStatus get status => _authBloc.state.status;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}

/// The app router.
class AppRouter {
  AppRouter({required AuthBloc authBloc})
      : _notifier = AuthRouterNotifier(authBloc);

  final AuthRouterNotifier _notifier;
  GoRouter? _cached;

  /// Built on first use so the notifier and the router are always paired.
  GoRouter get router => _cached ??= _build(_notifier);

  static GoRouter _build(AuthRouterNotifier notifier) {
    return GoRouter(
      initialLocation: AppRoutes.splash,
      refreshListenable: notifier,
      redirect: (BuildContext context, GoRouterState state) {
        final AuthStatus status = notifier.status;
        final String location = state.matchedLocation;

        if (status == AuthStatus.unknown) {
          return location == AppRoutes.splash ? null : AppRoutes.splash;
        }

        final bool atAuthRoute =
            location == AppRoutes.login || location == AppRoutes.register;

        if (status == AuthStatus.authenticated) {
          if (atAuthRoute || location == AppRoutes.splash) return AppRoutes.home;
          return null;
        }

        // Unauthenticated or signing in.
        return atAuthRoute ? null : AppRoutes.login;
      },
      errorBuilder: (BuildContext context, GoRouterState state) => _RouteNotFound(
        location: state.uri.toString(),
      ),
      routes: <RouteBase>[
        GoRoute(
          path: AppRoutes.splash,
          builder: (BuildContext context, GoRouterState state) => const SplashScreen(),
        ),
        GoRoute(
          path: AppRoutes.login,
          builder: (BuildContext context, GoRouterState state) => const LoginScreen(),
        ),
        GoRoute(
          path: AppRoutes.register,
          builder: (BuildContext context, GoRouterState state) => const RegisterScreen(),
        ),
        GoRoute(
          path: AppRoutes.home,
          builder: (BuildContext context, GoRouterState state) => const HomeScreen(),
        ),
        GoRoute(
          path: AppRoutes.medications,
          builder: (BuildContext context, GoRouterState state) => const MedicationsScreen(),
        ),
        GoRoute(
          path: AppRoutes.medicationDetailPath,
          builder: (BuildContext context, GoRouterState state) => MedicationDetailScreen(
            medicationId: state.pathParameters['id'] ?? '',
          ),
        ),
        GoRoute(
          path: AppRoutes.appointments,
          builder: (BuildContext context, GoRouterState state) => const AppointmentsScreen(),
        ),
        GoRoute(
          path: AppRoutes.careCircle,
          builder: (BuildContext context, GoRouterState state) => const CareCircleScreen(),
        ),
        GoRoute(
          path: AppRoutes.emergency,
          builder: (BuildContext context, GoRouterState state) => const EmergencyScreen(),
        ),
        GoRoute(
          path: AppRoutes.settings,
          builder: (BuildContext context, GoRouterState state) => const SettingsScreen(),
        ),
      ],
    );
  }

  void dispose() {
    _notifier.dispose();
    _cached?.dispose();
  }
}

class _RouteNotFound extends StatelessWidget {
  const _RouteNotFound({required this.location});

  final String location;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.screenPadding),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Semantics(
                header: true,
                child: Text(
                  'We could not open that screen',
                  style: Theme.of(context).textTheme.headlineSmall,
                  softWrap: true,
                  maxLines: null,
                ),
              ),
              const SizedBox(height: AppSizes.gap),
              Text(
                location,
                style: Theme.of(context).textTheme.bodyMedium,
                softWrap: true,
                maxLines: null,
              ),
              const SizedBox(height: AppSizes.gapLarge),
              AccessibleButton(
                label: 'Back to today',
                icon: Icons.home_outlined,
                expand: true,
                onPressed: () => context.go(AppRoutes.home),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
