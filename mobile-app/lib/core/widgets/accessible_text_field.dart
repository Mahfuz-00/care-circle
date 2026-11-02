import 'package:flutter/material.dart';

/// A labelled text field sized for seniors: large type, 64dp tall, with the
/// label exposed to screen readers.
///
/// Must be used inside a [Form] for [validator] to run.
class AccessibleTextField extends StatelessWidget {
  const AccessibleTextField({
    required this.controller,
    required this.label,
    this.helperText,
    this.autofillHints,
    this.keyboardType,
    this.obscureText = false,
    this.textInputAction = TextInputAction.next,
    this.validator,
    this.onFieldSubmitted,
    this.enabled = true,
    this.prefixIcon,
    this.maxLines = 1,
    this.autofocus = false,
    super.key,
  });

  final TextEditingController controller;
  final String label;
  final String? helperText;
  final Iterable<String>? autofillHints;
  final TextInputType? keyboardType;
  final bool obscureText;
  final TextInputAction textInputAction;
  final String? Function(String?)? validator;
  final void Function(String)? onFieldSubmitted;
  final bool enabled;
  final IconData? prefixIcon;
  final int maxLines;
  final bool autofocus;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      textField: true,
      label: label,
      hint: helperText,
      child: TextFormField(
        controller: controller,
        enabled: enabled,
        keyboardType: keyboardType,
        obscureText: obscureText,
        textInputAction: textInputAction,
        autofillHints: autofillHints,
        validator: validator,
        onFieldSubmitted: onFieldSubmitted,
        maxLines: maxLines,
        autofocus: autofocus,
        style: Theme.of(context).textTheme.bodyLarge,
        decoration: InputDecoration(
          labelText: label,
          helperText: helperText,
          prefixIcon: prefixIcon == null ? null : Icon(prefixIcon),
        ),
      ),
    );
  }
}
