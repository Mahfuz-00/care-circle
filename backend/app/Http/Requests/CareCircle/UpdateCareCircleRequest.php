<?php

declare(strict_types=1);

namespace App\Http\Requests\CareCircle;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCareCircleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:120'],
            'timezone' => ['sometimes', 'timezone'],
            // PRD §5.2 — configurable quiet hours per household.
            'quiet_hours_start' => ['sometimes', 'nullable', 'date_format:H:i'],
            'quiet_hours_end' => ['sometimes', 'nullable', 'date_format:H:i'],
        ];
    }
}
