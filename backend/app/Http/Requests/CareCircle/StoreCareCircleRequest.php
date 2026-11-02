<?php

declare(strict_types=1);

namespace App\Http\Requests\CareCircle;

use Illuminate\Foundation\Http\FormRequest;

class StoreCareCircleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'timezone' => ['nullable', 'timezone'],
        ];
    }
}
