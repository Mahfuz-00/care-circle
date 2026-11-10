import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/accessibility/announcer.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_sizes.dart';
import '../../../../core/widgets/accessible_button.dart';
import '../../../../core/widgets/accessible_text_field.dart';
import '../../../../core/widgets/app_logo_widget.dart';
import '../../../../core/widgets/message_banner.dart';
import '../../../../core/widgets/screen_scaffold.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

/// Sign in with the email and password of an existing care circle account.
class LoginScreen extends StatefulWidget {
  const LoginScreen({this.announcer, super.key});

  /// `null` means "use the settings-aware announcer from [AnnouncerScope]".
  final Announcer? announcer;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _email = TextEditingController();
  final TextEditingController _password = TextEditingController();

  Announcer get _announcer => widget.announcer ?? AnnouncerScope.of(context);

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  void _submit() {
    final FormState? form = _formKey.currentState;
    if (form == null || !form.validate()) {
      _announcer.announce(
        context,
        'Please check your email and password, then try again.',
      );
      return;
    }
    context.read<AuthBloc>().add(
          AuthLoginRequested(
            email: _email.text.trim(),
            password: _password.text,
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);

    return BlocConsumer<AuthBloc, AuthState>(
      listenWhen: (AuthState? previous, AuthState current) =>
          previous?.message != current.message,
      listener: (BuildContext context, AuthState state) {
        final String? message = state.message;
        if (message != null) {
          _announcer.announce(context, message);
        }
      },
      builder: (BuildContext context, AuthState state) => ScreenScaffold(
        title: 'Sign in',
        scrollable: true,
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              const AppLogoWidget(
                size: 48,
                showWordmark: true,
                subtitle: 'Senior Companion & Care',
              ),
              const SizedBox(height: AppSizes.gapLarge),
              Semantics(
                header: true,
                child: Text(
                  'Welcome back',
                  style: theme.textTheme.headlineMedium,
                  softWrap: true,
                  maxLines: null,
                ),
              ),
              const SizedBox(height: AppSizes.gap),
              Text(
                'Sign in to see today’s medicines and visits.',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                softWrap: true,
                maxLines: null,
              ),
              const SizedBox(height: AppSizes.gapLarge),
              if (state.message != null) ...<Widget>[
                MessageBanner(message: state.message!, tone: MessageBannerTone.error),
                const SizedBox(height: AppSizes.gapLarge),
              ],
              AccessibleTextField(
                controller: _email,
                label: 'Email address',
                keyboardType: TextInputType.emailAddress,
                autofillHints: const <String>[AutofillHints.email],
                helperText: 'The email you signed up with.',
                prefixIcon: Icons.alternate_email,
                validator: (String? value) {
                  final String email = value?.trim() ?? '';
                  if (email.isEmpty) return 'Enter your email address.';
                  if (!email.contains('@') || !email.contains('.')) {
                    return 'That does not look like an email address.';
                  }
                  return state.fieldErrors['email'];
                },
              ),
              const SizedBox(height: AppSizes.gapLarge),
              AccessibleTextField(
                controller: _password,
                label: 'Password',
                obscureText: true,
                textInputAction: TextInputAction.done,
                autofillHints: const <String>[AutofillHints.password],
                prefixIcon: Icons.lock_outline,
                onFieldSubmitted: (_) => _submit(),
                validator: (String? value) {
                  final String password = value ?? '';
                  if (password.isEmpty) return 'Enter your password.';
                  if (password.length < 8) {
                    return 'Passwords are at least 8 characters long.';
                  }
                  return state.fieldErrors['password'];
                },
              ),
              const SizedBox(height: AppSizes.gapLarge),
              AccessibleButton(
                label: 'Sign in',
                icon: Icons.login,
                expand: true,
                busy: state.isBusy,
                onPressed: state.isBusy ? null : _submit,
                semanticsHint: 'Signs you in with the email and password above',
              ),
              const SizedBox(height: AppSizes.gap),
              AccessibleButton(
                label: 'Create an account',
                icon: Icons.person_add_alt,
                filled: false,
                expand: true,
                onPressed: state.isBusy ? null : () => context.go(AppRoutes.register),
                semanticsHint: 'Opens the account setup screen',
              ),
              const SizedBox(height: AppSizes.gapLarge),
              Text(
                'CareCircle reminds you about medicines and appointments and keeps '
                'your care circle informed. It does not give medical advice.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                softWrap: true,
                maxLines: null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
