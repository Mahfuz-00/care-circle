import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'app.dart';
import 'core/di/injection.dart';
import 'features/appointments/presentation/bloc/appointments_bloc.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/auth/presentation/bloc/auth_event.dart';
import 'features/care_circle/presentation/bloc/care_circle_bloc.dart';
import 'features/emergency/presentation/bloc/emergency_bloc.dart';
import 'features/home/presentation/bloc/today_bloc.dart';
import 'features/medications/presentation/bloc/medications_bloc.dart';
import 'features/settings/presentation/bloc/settings_bloc.dart';
import 'features/settings/presentation/bloc/settings_event.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Config -> storage -> network -> data -> repositories -> use cases -> blocs.
  await configureDependencies();

  // Accessibility preferences are read before the first frame so the app never
  // shows the wrong text size (PRD §9).
  sl<SettingsBloc>().add(const SettingsRequested());

  // Restore the session stored on this device (mobile-ability token only).
  sl<AuthBloc>().add(const AuthStarted());

  runApp(
    MultiBlocProvider(
      providers: <BlocProvider<dynamic>>[
        // App-lifetime instances, shared by the router and every screen.
        BlocProvider<AuthBloc>.value(value: sl<AuthBloc>()),
        BlocProvider<TodayBloc>.value(value: sl<TodayBloc>()),
        BlocProvider<MedicationsBloc>.value(value: sl<MedicationsBloc>()),
        BlocProvider<AppointmentsBloc>.value(value: sl<AppointmentsBloc>()),
        BlocProvider<EmergencyBloc>.value(value: sl<EmergencyBloc>()),
        BlocProvider<CareCircleBloc>.value(value: sl<CareCircleBloc>()),
        BlocProvider<SettingsBloc>.value(value: sl<SettingsBloc>()),
      ],
      child: const CareCircleApp(),
    ),
  );
}
