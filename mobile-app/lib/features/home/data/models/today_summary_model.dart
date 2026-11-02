import '../../../../core/network/json.dart';
import '../../../appointments/data/models/appointment_model.dart';
import '../../../auth/data/models/care_circle_model.dart';
import '../../../medications/data/models/dose_model.dart';
import '../../domain/entities/today_summary.dart';

/// DTO for `GET /mobile/v1/today`.
class TodaySummaryModel {
  const TodaySummaryModel({
    required this.doses,
    required this.appointments,
    required this.careCircle,
    required this.unreadAlerts,
  });

  factory TodaySummaryModel.fromJson(Map<String, dynamic> json) => TodaySummaryModel(
        doses: Json
            .asMapList(json['doses'])
            .map(DoseModel.fromJson)
            .toList(growable: false),
        appointments: Json
            .asMapList(json['appointments'])
            .map(AppointmentModel.fromJson)
            .toList(growable: false),
        careCircle: CareCircleModel.fromJson(Json.asMap(json['care_circle'])),
        unreadAlerts: Json.asInt(json['unread_alerts']) ?? 0,
      );

  final List<DoseModel> doses;
  final List<AppointmentModel> appointments;
  final CareCircleModel careCircle;
  final int unreadAlerts;

  TodaySummary toEntity() => TodaySummary(
        doses: doses.map((DoseModel model) => model.toEntity()).toList(growable: false),
        appointments: appointments
            .map((AppointmentModel model) => model.toEntity())
            .toList(growable: false),
        careCircle: careCircle.toEntity(),
        unreadAlerts: unreadAlerts,
      );
}
