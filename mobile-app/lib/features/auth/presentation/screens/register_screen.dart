import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/accessibility/announcer.dart';
import '../../../../core/config/app_config.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_sizes.dart';
import '../../../../core/widgets/accessible_button.dart';
import '../../../../core/widgets/accessible_text_field.dart';
import '../../../../core/widgets/message_banner.dart';
import '../../../../core/widgets/screen_scaffold.dart';
import '../../domain/entities/care_role.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

/// Creates an account. The role chosen here decides what the care circle shows
/// this person (PRD §5.3, §6).
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({this.announcer, super.key});

  /// `null` means "use the settings-aware announcer from [AnnouncerScope]".
  final Announcer? announcer;

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _name = TextEditingController();
  final TextEditingController _email = TextEditingController();
  final TextEditingController _password = TextEditingController();
  CareRole _role = CareRole.self;

  /// Dart only exposes the short OS timezone name; the API stores what we send.
  late final String _timezone = DateTime.now().timeZoneName;

  Announcer get _announcer => widget.announcer ?? AnnouncerScope.of(context);

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  void _submit() {
    final FormState? form = _formKey.currentState;
    if (form == null || !form.validate()) {
      _announcer.announce(context, 'Please check the details above.');
      return;
    }
    context.read<AuthBloc>().add(
          AuthRegisterRequested(
            name: _name.text.trim(),
            email: _email.text.trim(),
            password: _password.text,
            role: _role,
            timezone: _timezone,
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
        if (message != null) _announcer.announce(context, message);
      },
      builder: (BuildContext context, AuthState state) {
        final bool busy = state.isBusy;

        return ScreenScaffold(
          title: 'Create account',
          scrollable: true,
          leading: IconButton(
            onPressed: busy ? null : () => context.go(AppRoutes.login),
            icon: const Icon(Icons.arrow_back),
            tooltip: 'Back to sign in',
          ),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Semantics(
                  header: true,
                  child: Text(
                    'Set up your ${AppConfig.appName} account',
                    style: theme.textTheme.headlineSmall,
                    softWrap: true,
                    maxLines: null,
                  ),
                ),
                const SizedBox(height: AppSizes.gapLarge),
                if (state.message != null) ...<Widget>[
                  MessageBanner(message: state.message!, tone: MessageBannerTone.error),
                  const SizedBox(height: AppSizes.gapLarge),
                ],
                AccessibleTextField(
                  controller: _name,
                  label: 'Your name',
                  autofillHints: const <String>[AutofillHints.name],
                  helperText: 'This is the name your care circle sees.',
                  prefixIcon: Icons.person_outline,
                  validator: (String? value) =>
                      (value == null || value.trim().length < 2)
                          ? 'Enter your name.'
                          : state.fieldErrors['name'],
                ),
                const SizedBox(height: AppSizes.gapLarge),
                AccessibleTextField(
                  controller: _email,
                  label: 'Email address',
                  keyboardType: TextInputType.emailAddress,
                  autofillHints: const <String>[AutofillHints.email],
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
                  autofillHints: const <String>[AutofillHints.newPassword],
                  helperText: 'At least 8 characters.',
                  prefixIcon: Icons.lock_outline,
                  validator: (String? value) {
                    final String password = value ?? '';
                    if (password.length < 8) {
                      return 'Passwords are at least 8 characters long.';
                    }
                    return state.fieldErrors['password'];
                  },
                ),
                const SizedBox(height: AppSizes.gapLarge),
                Semantics(
                  header: true,
                  child: Text('Who is this account for?', style: theme.textTheme.titleLarge),
                ),
                const SizedBox(height: AppSizes.gap / 2),
                Text(
                  'Your choice sets who you see and who sees you. You can change it later '
                  'with your care circle.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  softWrap: true,
                  maxLines: null,
                ),
                const SizedBox(height: AppSizes.gap),
                // RadioGroup (not the deprecated groupValue/onChanged pair) so
                // the whole set stays one accessible radio group.
                RadioGroup<CareRole>(
                  groupValue: _role,
                  onChanged: (CareRole? value) {
                    if (busy || value == null) return;
                    setState(() => _role = value);
                  },
                  child: Column(
                    children: <Widget>[
                      for (final CareRole role in CareRole.selectable)
                        RadioListTile<CareRole>(
                          value: role,
                          title: Text(role.label, style: theme.textTheme.bodyLarge),
                          subtitle: Text(
                            _roleDescription(role),
                            style: theme.textTheme.bodyMedium,
                          ),
                          contentPadding: EdgeInsets.zero,
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSizes.gap),
                Text(
                  'Timezone: $_timezone',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  softWrap: true,
                ),
                const SizedBox(height: AppSizes.gapLarge),
                AccessibleButton(
                  label: 'Create my account',
                  icon: Icons.check,
                  expand: true,
                  busy: busy,
                  onPressed: busy ? null : _submit,
                  semanticsHint: 'Creates your account and care circle',
                ),
                const SizedBox(height: AppSizes.gap),
                AccessibleButton(
                  label: 'I already have an account',
                  filled: false,
                  expand: true,
                  onPressed: busy ? null : () => context.go(AppRoutes.login),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  String _roleDescription(CareRole role) => switch (role) {
        CareRole.self => 'You manage your own medicines and appointments.',
        CareRole.senior => 'Your care circle can see your medicines and visits.',
        CareRole.caregiver => 'You help someone else and can respond to alerts.',
        _ => 'A member of a care circle.',
      };
}
