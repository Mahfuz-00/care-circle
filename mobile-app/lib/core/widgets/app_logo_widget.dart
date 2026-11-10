import 'dart:math' as math;
import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// CareCircle Guardian Orbital Logo in pure Flutter.
///
/// Geometric structure (PRD §12 & AppLogo.tsx):
/// - Outer continuous harmonic arc in Deep Navy (strength, calm vigilance)
/// - Inner synchronized arc in Luminous Sky (vitality, coordination)
/// - Central anchor node (the loved one safeguarded at the center)
/// - Ambient orbit satellite (active vigilance indicator)
class AppLogoWidget extends StatelessWidget {
  const AppLogoWidget({
    this.size = 36.0,
    this.showWordmark = true,
    this.subtitle,
    super.key,
  });

  final double size;
  final bool showWordmark;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    final Widget mark = SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _GuardianOrbitalPainter(),
      ),
    );

    if (!showWordmark) {
      return mark;
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: <Widget>[
        mark,
        const SizedBox(width: 10),
        Flexible(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              RichText(
                text: TextSpan(
                  style: TextStyle(
                    fontSize: size * 0.58,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                    height: 1.1,
                    fontFamily: 'Inter',
                  ),
                  children: const <InlineSpan>[
                    TextSpan(
                      text: 'Care',
                      style: TextStyle(color: AppColors.ink),
                    ),
                    TextSpan(
                      text: 'Circle',
                      style: TextStyle(color: AppColors.forestTeal),
                    ),
                  ],
                ),
              ),
              if (subtitle != null)
                Text(
                  subtitle!,
                  style: TextStyle(
                    fontSize: size * 0.32,
                    fontWeight: FontWeight.w500,
                    color: AppColors.inkMuted,
                    height: 1.1,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _GuardianOrbitalPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double center = size.width / 2;
    final Offset c = Offset(center, center);

    // 1. Outer Guardian Arc (Navy Gradient)
    final double outerR = center * 0.82;
    final Rect outerRect = Rect.fromCircle(center: c, radius: outerR);
    final Paint outerPaint = Paint()
      ..shader = const LinearGradient(
        colors: <Color>[AppColors.deepSage, AppColors.deepSageStrong],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ).createShader(outerRect)
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.082
      ..strokeCap = StrokeCap.round;

    // Sweeps ~285 degrees starting at -40 degrees
    canvas.drawArc(
      outerRect,
      -40 * math.pi / 180,
      285 * math.pi / 180,
      false,
      outerPaint,
    );

    // 2. Inner Synchronized Care Arc (Sky Blue Gradient)
    final double innerR = center * 0.55;
    final Rect innerRect = Rect.fromCircle(center: c, radius: innerR);
    final Paint innerPaint = Paint()
      ..shader = const LinearGradient(
        colors: <Color>[Color(0xFF38BDF8), AppColors.forestTeal],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ).createShader(innerRect)
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.075
      ..strokeCap = StrokeCap.round;

    // Sweeps ~270 degrees starting at 130 degrees
    canvas.drawArc(
      innerRect,
      130 * math.pi / 180,
      270 * math.pi / 180,
      false,
      innerPaint,
    );

    // 3. Central Anchor Node (The Loved One)
    final double coreR = center * 0.22;
    final Paint corePaint = Paint()
      ..shader = const LinearGradient(
        colors: <Color>[Color(0xFF60A5FA), AppColors.sage],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ).createShader(Rect.fromCircle(center: c, radius: coreR));
    canvas.drawCircle(c, coreR, corePaint);

    final Paint coreCenterPaint = Paint()..color = Colors.white;
    canvas.drawCircle(c, coreR * 0.42, coreCenterPaint);

    // 4. Ambient Orbit Satellite (Active Vigilance Indicator)
    final double satAngle = -35 * math.pi / 180;
    final double satDist = outerR * 0.95;
    final Offset satPos = Offset(
      c.dx + satDist * math.cos(satAngle),
      c.dy + satDist * math.sin(satAngle),
    );
    final double satR = center * 0.13;

    final Paint satPaint = Paint()..color = AppColors.forestTeal;
    canvas.drawCircle(satPos, satR, satPaint);

    final Paint satCenterPaint = Paint()..color = Colors.white;
    canvas.drawCircle(satPos, satR * 0.45, satCenterPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
