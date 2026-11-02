<?php

declare(strict_types=1);

namespace App\Http\Requests\Appointment;

use App\Enums\AppointmentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:160'],
            'type' => ['sometimes', Rule::enum(AppointmentType::class)],
            'location' => ['sometimes', 'nullable', 'string', 'max:190'],
            'starts_at' => ['sometimes', 'date'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'shared_with_circle' => ['sometimes', 'boolean'],
            'reminder_offsets' => ['sometimes', 'array'],
            'reminder_offsets.*' => ['integer', 'min:0', 'max:10080'],
        ];
    }
}
