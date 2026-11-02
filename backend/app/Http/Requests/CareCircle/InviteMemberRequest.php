<?php

declare(strict_types=1);

namespace App\Http\Requests\CareCircle;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InviteMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'email' => ['required_without:phone', 'nullable', 'email', 'max:190'],
            'phone' => ['required_without:email', 'nullable', 'string', 'max:32'],
            // PRD §5.3 — invite by email or phone with a clear permission level.
            'role' => ['required', Rule::in(config('roles.assignable'))],
        ];
    }
}
