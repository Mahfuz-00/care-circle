<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarketingPromotion extends Model
{
    use HasFactory;

    protected $table = 'marketing_promotions';

    protected $fillable = [
        'code',
        'description',
        'discount_type',
        'discount_value',
        'currency',
        'duration',
        'max_redemptions',
        'redeemed_count',
        'is_active',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'integer',
            'max_redemptions' => 'integer',
            'redeemed_count' => 'integer',
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }
}
