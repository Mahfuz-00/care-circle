import '../error/exceptions.dart';

/// Lenient JSON helpers for the documented `/mobile/v1` contract.
///
/// The API may send ids as integers or strings, and dates as ISO-8601 strings;
/// these helpers keep the DTOs readable and the failures explicit.
abstract final class Json {
  static String? asString(Object? value) {
    if (value == null) return null;
    if (value is String) return value;
    return value.toString();
  }

  /// Reads a required, non-empty string.
  static String requiredString(Object? value, String field) {
    final String? string = asString(value);
    if (string == null || string.isEmpty) {
      throw ParseException('Missing required field "$field".');
    }
    return string;
  }

  static int? asInt(Object? value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is num) return value.round();
    if (value is String) return int.tryParse(value);
    return null;
  }

  static bool asBool(Object? value, {bool whenMissing = false}) {
    if (value is bool) return value;
    if (value is num) return value != 0;
    if (value is String) {
      final String normalized = value.toLowerCase();
      if (normalized == 'true' || normalized == '1') return true;
      if (normalized == 'false' || normalized == '0') return false;
    }
    return whenMissing;
  }

  static DateTime? asDateTime(Object? value) {
    if (value is String && value.isNotEmpty) return DateTime.tryParse(value);
    return null;
  }

  static List<String> asStringList(Object? value) {
    if (value is List) {
      return value
          .map(asString)
          .whereType<String>()
          .where((String item) => item.isNotEmpty)
          .toList(growable: false);
    }
    return const <String>[];
  }

  static Map<String, dynamic> asMap(Object? value) {
    if (value is Map<String, dynamic>) return value;
    if (value is Map) return Map<String, dynamic>.from(value);
    return const <String, dynamic>{};
  }

  static List<Map<String, dynamic>> asMapList(Object? value) {
    if (value is List) {
      return value.map(asMap).toList(growable: false);
    }
    return const <Map<String, dynamic>>[];
  }
}
