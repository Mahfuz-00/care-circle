import 'package:url_launcher/url_launcher.dart';

/// One-tap call and SMS (PRD §5.1 P0: preferred pharmacy with one-tap call).
///
/// Kept as a small object rather than static calls so screens can be tested
/// with a fake that records the number instead of dialling it.
class PhoneActions {
  const PhoneActions();

  Future<bool> call(String phoneNumber) =>
      _launch(Uri(scheme: 'tel', path: _normalise(phoneNumber)));

  Future<bool> sendSms(String phoneNumber, {String? body}) => _launch(
        Uri(
          scheme: 'sms',
          path: _normalise(phoneNumber),
          queryParameters: body == null ? null : <String, String>{'body': body},
        ),
      );

  Future<bool> _launch(Uri uri) => launchUrl(uri, mode: LaunchMode.externalApplication);

  String _normalise(String value) => value.replaceAll(RegExp(r'[^0-9+]'), '');
}
