<?php

declare(strict_types=1);

namespace App\Http\Requests\Dose;

use Illuminate\Foundation\Http\FormRequest;

class TakeDoseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            // Optional photo confirmation — PRD §5.1.
            'photo' => ['nullable', 'string', 'max:255'],
        ];
    }
}
