<?php

declare(strict_types=1);

namespace App\Http\Requests\Emergency;

use App\Enums\EmergencyType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RaiseEmergencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(EmergencyType::class)],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'location_label' => ['nullable', 'string', 'max:190'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
