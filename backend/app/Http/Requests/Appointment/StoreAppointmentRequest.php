<?php

declare(strict_types=1);

namespace App\Http\Requests\Appointment;

use App\Enums\AppointmentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'type' => ['required', Rule::enum(AppointmentType::class)],
            'location' => ['nullable', 'string', 'max:190'],
            'starts_at' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'shared_with_circle' => ['sometimes', 'boolean'],
            // Minutes before the appointment — PRD §5.4.
            'reminder_offsets' => ['sometimes', 'array'],
            'reminder_offsets.*' => ['integer', 'min:0', 'max:10080'],
            'owner_user_id' => ['sometimes', 'integer', 'exists:users,id'],
        ];
    }
}
