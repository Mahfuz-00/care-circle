<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedbackReport extends Model
{
    use HasFactory;

    protected $table = 'feedback_reports';

    protected $fillable = [
        'care_circle_id',
        'user_id',
        'type',
        'priority',
        'status',
        'subject',
        'body',
        'context',
        'resolution_note',
        'resolved_at',
        'resolved_by',
    ];

    protected function casts(): array
    {
        return [
            'context' => 'array',
            'resolved_at' => 'datetime',
        ];
    }

    public function careCircle(): BelongsTo
    {
        return $this->belongsTo(CareCircle::class, 'care_circle_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
