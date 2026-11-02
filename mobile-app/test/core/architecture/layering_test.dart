import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

/// Architecture guards (AGENTS.md: "the domain layer imports no Flutter/dio",
/// and the mobile surface must never reach `/api/v1`).
void main() {
  /// Files that are allowed to name a forbidden path (they define or enforce
  /// the rule).
  const Set<String> pathRuleOwners = <String>{
    'lib/core/config/app_config.dart',
    'lib/core/network/mobile_surface_guard_interceptor.dart',
  };

  const List<String> forbiddenDomainImports = <String>[
    'package:flutter/',
    'package:dio/',
    'package:go_router/',
    'package:get_it/',
    'package:flutter_bloc/',
    'package:shared_preferences/',
    'package:flutter_secure_storage/',
    'package:url_launcher/',
    'dart:io',
    'dart:ui',
  ];

  List<File> dartFilesUnder(String path) {
    final Directory directory = Directory(path);
    if (!directory.existsSync()) return <File>[];
    return directory
        .listSync(recursive: true)
        .whereType<File>()
        .where((File file) => file.path.endsWith('.dart'))
        .toList(growable: false);
  }

  String normalise(String path) => path.replaceAll('\\', '/');

  test('domain layers stay pure Dart (no Flutter, no dio, no platform plugins)', () {
    final List<String> violations = <String>[];

    for (final File file in dartFilesUnder('lib/features')) {
      final String path = normalise(file.path);
      if (!path.contains('/domain/')) continue;

      final List<String> lines = file.readAsLinesSync();
      for (int i = 0; i < lines.length; i++) {
        final String line = lines[i].trim();
        if (!line.startsWith('import ') && !line.startsWith('export ')) continue;
        for (final String forbidden in forbiddenDomainImports) {
          if (line.contains(forbidden)) {
            violations.add('$path:${i + 1} -> $line');
          }
        }
      }
    }

    expect(
      violations,
      isEmpty,
      reason: 'The domain layer must not depend on Flutter, dio or any plugin:\n'
          '${violations.join('\n')}',
    );
  });

  test('only the surface guard and the config know about /api/v1', () {
    final List<String> violations = <String>[];

    for (final File file in dartFilesUnder('lib')) {
      final String path = normalise(file.path);
      if (pathRuleOwners.contains(path)) continue;

      final String content = file.readAsStringSync();
      if (content.contains('/api/v1') || content.contains('/platform/')) {
        violations.add(path);
      }
    }

    expect(
      violations,
      isEmpty,
      reason: 'The mobile app must never call the dashboard or landlord '
          'surfaces:\n${violations.join('\n')}',
    );
  });

  test('every request path in the data layer is a /mobile/v1 relative path', () {
    final List<String> violations = <String>[];
    final RegExp pathLiteral = RegExp(r"'(/[A-Za-z0-9/_{}$\-]*)'");

    for (final File file in dartFilesUnder('lib/features')) {
      final String path = normalise(file.path);
      if (!path.contains('/data/datasources/')) continue;

      final String content = file.readAsStringSync();
      for (final RegExpMatch match in pathLiteral.allMatches(content)) {
        final String value = match.group(1)!;
        // Only look at strings that are used as endpoint paths.
        if (!content.contains("_client.getObject('$value'") &&
            !content.contains("_client.getObjects('$value'") &&
            !content.contains("_client.postObject('$value'") &&
            !content.contains("_client.postNoContent('$value'")) {
          continue;
        }
        if (!value.startsWith('/')) violations.add('$path -> $value');
      }
    }

    expect(violations, isEmpty, reason: violations.join('\n'));
  });
}
