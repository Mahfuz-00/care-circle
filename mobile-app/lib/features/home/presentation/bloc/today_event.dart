import 'package:equatable/equatable.dart';

/// Events for the Today view.
sealed class TodayEvent extends Equatable {
  const TodayEvent();

  @override
  List<Object?> get props => const <Object?>[];
}

/// First load.
final class TodayRequested extends TodayEvent {
  const TodayRequested();
}

/// Pull to refresh.
final class TodayRefreshed extends TodayEvent {
  const TodayRefreshed();
}

/// One tap: "I took it".
final class TodayTakeDoseRequested extends TodayEvent {
  const TodayTakeDoseRequested({required this.doseId, this.photoBase64});

  final String doseId;
  final String? photoBase64;

  @override
  List<Object?> get props => <Object?>[doseId, photoBase64];
}

/// One tap: "Skip" (with an optional recorded reason, PRD §7).
final class TodaySkipDoseRequested extends TodayEvent {
  const TodaySkipDoseRequested({required this.doseId, this.reason});

  final String doseId;
  final String? reason;

  @override
  List<Object?> get props => <Object?>[doseId, reason];
}

/// One tap: "Snooze".
final class TodaySnoozeDoseRequested extends TodayEvent {
  const TodaySnoozeDoseRequested({required this.doseId, required this.minutes});

  final String doseId;
  final int minutes;

  @override
  List<Object?> get props => <Object?>[doseId, minutes];
}

/// Dismiss the current banner.
final class TodayMessageCleared extends TodayEvent {
  const TodayMessageCleared();
}
