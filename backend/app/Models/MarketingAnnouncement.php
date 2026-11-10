<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarketingAnnouncement extends Model
{
    use HasFactory;

    protected $table = 'marketing_announcements';

    protected $fillable = [
        'title',
        'message',
        'cta_text',
        'cta_url',
        'tone',
        'target_audience',
        'is_active',
        'impressions_count',
        'clicks_count',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'impressions_count' => 'integer',
            'clicks_count' => 'integer',
        ];
    }
}
