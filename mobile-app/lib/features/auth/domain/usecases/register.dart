import '../../../../core/error/result.dart';
import '../entities/auth_session.dart';
import '../repositories/auth_repository.dart';

/// Creates an account and its first care circle.
class Register {
  const Register(this._repository);

  final AuthRepository _repository;

  Future<Result<AuthSession>> call(RegisterRequest request) =>
      _repository.register(request);
}
