import 'package:flutter/material.dart';

import '../../../../core/theme/app_sizes.dart';
import '../../../../core/utils/date_formatting.dart';
import '../../domain/entities/appointment.dart';

/// One appointment, with the date spelled out rather than abbreviated.
class AppointmentCard extends StatelessWidget {
  const AppointmentCard({required this.appointment, this.showFullDate = true, super.key});

  final Appointment appointment;
  final bool showFullDate;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final String when = showFullDate
        ? DateFormatting.relativeDayAndTime(appointment.startsAt)
        : DateFormatting.time(appointment.startsAt);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSizes.gapLarge),
        child: Semantics(
          container: true,
          label: <String>[
            appointment.title,
            when,
            if (appointment.type.isNotEmpty) appointment.type,
            if (appointment.location.isNotEmpty) 'at ${appointment.location}',
            if (appointment.hasNotes) 'Notes: ${appointment.notes}',
          ].join('. '),
          child: ExcludeSemantics(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  when,
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: theme.colorScheme.secondary,
                  ),
                  softWrap: true,
                  maxLines: null,
                ),
                const SizedBox(height: AppSizes.gap / 2),
                Text(
                  appointment.title,
                  style: theme.textTheme.titleLarge,
                  softWrap: true,
                  maxLines: null,
                ),
                if (appointment.type.isNotEmpty) ...<Widget>[
                  const SizedBox(height: AppSizes.gap / 2),
                  Text(
                    appointment.type,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    softWrap: true,
                    maxLines: null,
                  ),
                ],
                if (appointment.location.isNotEmpty) ...<Widget>[
                  const SizedBox(height: AppSizes.gap / 2),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Icon(
                        Icons.place_outlined,
                        size: 22,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: AppSizes.gap / 2),
                      Expanded(
                        child: Text(
                          appointment.location,
                          style: theme.textTheme.bodyLarge,
                          softWrap: true,
                          maxLines: null,
                        ),
                      ),
                    ],
                  ),
                ],
                if (appointment.hasNotes) ...<Widget>[
                  const SizedBox(height: AppSizes.gap),
                  Text(
                    appointment.notes!,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    softWrap: true,
                    maxLines: null,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
