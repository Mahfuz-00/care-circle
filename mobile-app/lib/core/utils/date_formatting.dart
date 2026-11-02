import 'package:intl/intl.dart';

/// Date and time formatting for a senior audience: explicit, unambiguous,
/// never abbreviated into something unreadable.
abstract final class DateFormatting {
  static const String _timePattern = 'h:mm a';
  static const String _dayPattern = 'EEEE, d MMMM';
  static const String _dayTimePattern = 'EEE d MMM, h:mm a';

  static String time(DateTime value) =>
      DateFormat(_timePattern).format(value.toLocal());

  static String day(DateTime value) =>
      DateFormat(_dayPattern).format(value.toLocal());

  static String dayAndTime(DateTime value) =>
      DateFormat(_dayTimePattern).format(value.toLocal());

  /// "Today", "Tomorrow", or the full weekday + date.
  static String relativeDay(DateTime value, {DateTime? now}) {
    final DateTime today = _dateOnly(now ?? DateTime.now());
    final DateTime target = _dateOnly(value);
    final int difference = target.difference(today).inDays;
    if (difference == 0) return 'Today';
    if (difference == 1) return 'Tomorrow';
    if (difference == -1) return 'Yesterday';
    return day(value);
  }

  /// "Today at 8:00 AM" — used in reminder copy.
  static String relativeDayAndTime(DateTime value, {DateTime? now}) =>
      '${relativeDay(value, now: now)} at ${time(value)}';

  static bool isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  static bool isToday(DateTime value, {DateTime? now}) =>
      isSameDay(value, now ?? DateTime.now());

  static DateTime _dateOnly(DateTime value) =>
      DateTime(value.year, value.month, value.day);
}
