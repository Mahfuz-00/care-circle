import '../../../../core/error/result.dart';
import '../entities/auth_session.dart';
import '../repositories/auth_repository.dart';

/// Loads the signed-in person plus the care circles they can see.
class LoadAccount {
  const LoadAccount(this._repository);

  final AuthRepository _repository;

  Future<Result<AuthAccount>> call() => _repository.loadAccount();
}
