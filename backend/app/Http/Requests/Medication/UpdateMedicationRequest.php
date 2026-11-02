<?php

declare(strict_types=1);

namespace App\Http\Requests\Medication;

use App\Enums\MedicationFrequency;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMedicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:160'],
            'dosage' => ['sometimes', 'string', 'max:80'],
            'form' => ['sometimes', 'nullable', 'string', 'max:40'],
            'instructions' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'photo_path' => ['sometimes', 'nullable', 'string', 'max:255'],
            'frequency' => ['sometimes', Rule::enum(MedicationFrequency::class)],
            'times' => ['sometimes', 'array'],
            'times.*' => ['date_format:H:i'],
            'days_of_week' => ['sometimes', 'array'],
            'days_of_week.*' => ['integer', 'between:0,6'],
            'with_food' => ['sometimes', 'boolean'],
            'is_high_priority' => ['sometimes', 'boolean'],
            'stock_quantity' => ['sometimes', 'integer', 'min:0'],
            'units_per_dose' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'low_stock_threshold' => ['sometimes', 'integer', 'min:0'],
            'refill_reminder_days' => ['sometimes', 'integer', 'min:0', 'max:90'],
            'pharmacy_name' => ['sometimes', 'nullable', 'string', 'max:120'],
            'pharmacy_phone' => ['sometimes', 'nullable', 'string', 'max:32'],
            'starts_on' => ['sometimes', 'nullable', 'date'],
            'ends_on' => ['sometimes', 'nullable', 'date'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
