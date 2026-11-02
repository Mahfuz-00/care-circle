<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use App\Enums\MemberRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:32'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'timezone' => ['nullable', 'timezone'],
            'circle_name' => ['nullable', 'string', 'max:120'],
            // A new account is either a self-user or a senior at the centre of a circle.
            'role' => ['required', Rule::in([MemberRole::SelfUser->value, MemberRole::Senior->value])],
            'device_name' => ['nullable', 'string', 'max:120'],
        ];
    }
}
