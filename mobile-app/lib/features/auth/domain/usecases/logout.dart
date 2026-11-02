import '../../../../core/error/result.dart';
import '../repositories/auth_repository.dart';

/// Ends the session on this device (and tells the API to revoke the token).
class Logout {
  const Logout(this._repository);

  final AuthRepository _repository;

  Future<Result<void>> call() => _repository.logout();
}
