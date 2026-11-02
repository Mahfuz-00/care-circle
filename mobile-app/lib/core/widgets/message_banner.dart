import 'package:flutter/material.dart';

import '../theme/app_sizes.dart';

/// The kind of message a banner carries.
enum MessageBannerTone { info, warning, error, success }

/// An inline banner for status and errors.
///
/// Marked as a live region so TalkBack/VoiceOver read it when it appears —
/// this is the Android-safe half of the voice-first path (PRD §9).
class MessageBanner extends StatelessWidget {
  const MessageBanner({
    required this.message,
    this.tone = MessageBannerTone.info,
    this.action,
    super.key,
  });

  final String message;
  final MessageBannerTone tone;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final (Color background, Color foreground, IconData icon) = switch (tone) {
      MessageBannerTone.info => (
          theme.colorScheme.secondaryContainer,
          theme.colorScheme.onSecondaryContainer,
          Icons.info_outline,
        ),
      MessageBannerTone.success => (
          theme.colorScheme.primaryContainer,
          theme.colorScheme.onPrimaryContainer,
          Icons.check_circle_outline,
        ),
      MessageBannerTone.warning => (
          theme.colorScheme.surfaceContainerHighest,
          theme.colorScheme.error,
          Icons.warning_amber_rounded,
        ),
      MessageBannerTone.error => (
          theme.colorScheme.error,
          theme.colorScheme.onError,
          Icons.error_outline,
        ),
    };

    return Semantics(
      liveRegion: true,
      container: true,
      label: message,
      child: ExcludeSemantics(
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSizes.gap + 4),
          decoration: BoxDecoration(
            color: background,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: foreground.withValues(alpha: 0.35)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Icon(icon, color: foreground),
              const SizedBox(width: AppSizes.gap),
              Expanded(
                child: Text(
                  message,
                  style: theme.textTheme.bodyLarge?.copyWith(color: foreground),
                  softWrap: true,
                  maxLines: null,
                ),
              ),
              if (action != null) ...<Widget>[
                const SizedBox(width: AppSizes.gap),
                action!,
              ],
            ],
          ),
        ),
      ),
    );
  }
}
