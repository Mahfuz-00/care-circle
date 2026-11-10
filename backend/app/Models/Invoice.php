<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;

    protected $table = 'invoices';

    protected $fillable = [
        'care_circle_id',
        'invoice_number',
        'amount_cents',
        'currency',
        'status',
        'plan_code',
        'billing_period',
        'period_start',
        'period_end',
        'paid_at',
        'payment_method',
        'last4',
        'line_items',
    ];

    protected function casts(): array
    {
        return [
            'amount_cents' => 'integer',
            'period_start' => 'datetime',
            'period_end' => 'datetime',
            'paid_at' => 'datetime',
            'line_items' => 'array',
        ];
    }

    public function careCircle(): BelongsTo
    {
        return $this->belongsTo(CareCircle::class, 'care_circle_id');
    }
}
