<?php

declare(strict_types=1);

namespace App\Http\Requests\Medication;

use App\Enums\MedicationFrequency;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMedicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:160'],
            'dosage' => ['required', 'string', 'max:80'],
            'form' => ['nullable', 'string', 'max:40'],
            'instructions' => ['nullable', 'string', 'max:1000'],
            'photo_path' => ['nullable', 'string', 'max:255'],
            'frequency' => ['required', Rule::enum(MedicationFrequency::class)],
            'times' => ['present', 'array'],
            'times.*' => ['date_format:H:i'],
            'days_of_week' => ['nullable', 'array'],
            'days_of_week.*' => ['integer', 'between:0,6'],
            'with_food' => ['sometimes', 'boolean'],
            'is_high_priority' => ['sometimes', 'boolean'],
            'stock_quantity' => ['sometimes', 'integer', 'min:0'],
            'units_per_dose' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'low_stock_threshold' => ['sometimes', 'integer', 'min:0'],
            'refill_reminder_days' => ['sometimes', 'integer', 'min:0', 'max:90'],
            'pharmacy_name' => ['nullable', 'string', 'max:120'],
            'pharmacy_phone' => ['nullable', 'string', 'max:32'],
            'starts_on' => ['nullable', 'date'],
            'ends_on' => ['nullable', 'date', 'after_or_equal:starts_on'],
            // A caregiver may create a medication for any member; a subject only for themselves.
            'owner_user_id' => ['sometimes', 'integer', 'exists:users,id'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'times.required' => 'A scheduled medication needs at least one time of day.',
        ];
    }
}
