import '../repositories/auth_repository.dart';

/// Whether this device already holds a mobile token.
class HasSession {
  const HasSession(this._repository);

  final AuthRepository _repository;

  Future<bool> call() => _repository.hasSession();
}
