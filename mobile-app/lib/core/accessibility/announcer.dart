import 'dart:ui' show FlutterView;

import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';

/// Voice-first path for seniors (PRD §9).
///
/// CareCircle speaks short confirmations through the platform accessibility
/// bridge when the platform supports announcements (iOS/VoiceOver, web). Where
/// it does not — Android deprecates announcement events in favour of live
/// regions — every screen also marks the same information as
/// `Semantics(liveRegion: true)`, which TalkBack reads when it changes.
class Announcer {
  const Announcer({this.enabled = true});

  /// Comes from the person's accessibility settings.
  final bool enabled;

  Future<void> announce(BuildContext context, String message) async {
    if (!enabled) return;

    final String trimmed = message.trim();
    if (trimmed.isEmpty) return;
    if (!MediaQuery.supportsAnnounceOf(context)) return;

    final FlutterView? view = View.maybeOf(context);
    if (view == null) return;

    await SemanticsService.sendAnnouncement(
      view,
      trimmed,
      Directionality.of(context),
    );
  }
}

/// Makes the settings-aware [Announcer] available to every screen.
class AnnouncerScope extends InheritedWidget {
  const AnnouncerScope({required this.announcer, required super.child, super.key});

  final Announcer announcer;

  static Announcer of(BuildContext context) {
    final AnnouncerScope? scope =
        context.dependOnInheritedWidgetOfExactType<AnnouncerScope>();
    return scope?.announcer ?? const Announcer();
  }

  @override
  bool updateShouldNotify(AnnouncerScope oldWidget) =>
      oldWidget.announcer.enabled != announcer.enabled;
}
