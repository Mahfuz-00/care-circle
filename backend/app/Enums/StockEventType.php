<?php

declare(strict_types=1);

namespace App\Enums;

enum StockEventType: string
{
    case DoseTaken = 'dose_taken';
    case Adjustment = 'adjustment';
    case Refill = 'refill';
    case LowStockAlert = 'low_stock_alert';
    case Depleted = 'depleted';
}
