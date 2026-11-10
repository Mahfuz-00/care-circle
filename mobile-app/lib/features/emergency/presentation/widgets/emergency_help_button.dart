import 'package:flutter/material.dart';

import '../../../../core/config/app_config.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_sizes.dart';

/// The emergency button (PRD §5.5, PRD §13).
///
/// * at least [AppSizes.emergencyButtonHeight] (96dp) tall — never below the
///   required 64dp, on any screen size;
/// * **one deliberate press** raises the alert: no confirmation dialog, no
///   double-tap, no long-press;
/// * exposes one large, unambiguous label to screen readers.
class EmergencyHelpButton extends StatelessWidget {
  const EmergencyHelpButton({
    required this.onPressed,
    this.busy = false,
    this.label = 'I need help',
    this.semanticHint = 'Press once. Your care circle is told straight away.',
    super.key,
  });

  final VoidCallback? onPressed;
  final bool busy;
  final String label;
  final String semanticHint;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final bool enabled = onPressed != null && !busy;

    return Semantics(
      button: true,
      enabled: enabled,
      label: '$label. Sends an emergency alert to your care circle.',
      hint: semanticHint,
      child: ExcludeSemantics(
        child: SizedBox(
          width: double.infinity,
          height: AppSizes.emergencyButtonHeight,
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: enabled
                    ? const <Color>[AppColors.alert, AppColors.alertStrong]
                    : <Color>[
                        AppColors.alert.withValues(alpha: 0.6),
                        AppColors.alertStrong.withValues(alpha: 0.6),
                      ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(AppSizes.radius),
              boxShadow: enabled
                  ? const <BoxShadow>[
                      BoxShadow(
                        color: Color(0x38DC2626),
                        blurRadius: 14,
                        offset: Offset(0, 5),
                      ),
                    ]
                  : null,
            ),
            child: FilledButton(
              onPressed: enabled ? onPressed : null,
              style: FilledButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                foregroundColor: Colors.white,
                disabledBackgroundColor: Colors.transparent,
                disabledForegroundColor: Colors.white70,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppSizes.radius),
                ),
                textStyle: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16),
              ),
              child: busy
                  ? const SizedBox.square(
                      dimension: 32,
                      child: CircularProgressIndicator(
                        strokeWidth: 4,
                        color: Colors.white,
                      ),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.emergency, size: 28, color: Colors.white),
                        ),
                        const SizedBox(width: AppSizes.gap),
                        Flexible(
                          child: Text(
                            label,
                            softWrap: true,
                            style: theme.textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }

  /// Dial-the-phone-book entry point for the same emergency situation,
  /// offered next to the in-app button (PRD §5.5: optional direct call).
  static String get emergencyNumber => AppConfig.emergencyCallNumber;
}
