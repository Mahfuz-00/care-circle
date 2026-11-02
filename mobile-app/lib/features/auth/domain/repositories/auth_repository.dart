import '../../../../core/error/result.dart';
import '../entities/auth_session.dart';

/// Authentication and account access for the mobile surface.
abstract interface class AuthRepository {
  /// Whether a token is already stored on this device.
  Future<bool> hasSession();

  Future<Result<AuthSession>> login({
    required String email,
    required String password,
  });

  Future<Result<AuthSession>> register(RegisterRequest request);

  /// `GET /auth/me` — refreshes the person and their care circles.
  Future<Result<AuthAccount>> loadAccount();

  /// Clears the stored session even if the API call fails.
  Future<Result<void>> logout();

  /// Chooses which care circle the app shows (`X-Care-Circle`).
  Future<Result<void>> setActiveCareCircle(String careCircleId);
}
