<?php

declare(strict_types=1);

namespace App\Http\Requests\CareCircle;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'role' => ['sometimes', Rule::in(config('roles.assignable'))],
            'receive_emergency_alerts' => ['sometimes', 'boolean'],
            'voice_consent' => ['sometimes', 'boolean'],
        ];
    }
}
