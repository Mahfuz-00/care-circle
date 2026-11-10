<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Platform;

use App\Enums\AuditLevel;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Platform\Concerns\ReadsAcrossTenants;
use App\Models\CareCircle;
use App\Models\Invoice;
use App\Models\RefundRequest;
use App\Services\Auditing\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class BillingController extends Controller
{
    use ReadsAcrossTenants;

    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): JsonResponse
    {
        $this->auditPlatformRead('platform.invoices_viewed');

        $query = Invoice::query()
            ->with(['careCircle:id,name,plan_code,status'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')->toString()))
            ->when($request->filled('payment_method'), fn ($q) => $q->where('payment_method', $request->string('payment_method')->toString()))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->string('search')->toString().'%';
                $q->where(function ($sub) use ($term) {
                    $sub->where('invoice_number', 'ilike', $term)
                        ->orWhereHas('careCircle', fn ($c) => $c->where('name', 'ilike', $term));
                });
            })
            ->latest('id');

        $invoices = $query->paginate(min(100, max(1, $request->integer('per_page', 20))));

        $totalRevenueCents = Invoice::where('status', 'paid')->sum('amount_cents');
        $pendingCashCount = Invoice::where('payment_method', 'cash')->where('status', 'pending')->count();
        $pendingCashCents = Invoice::where('payment_method', 'cash')->where('status', 'pending')->sum('amount_cents');
        $paidCount = Invoice::where('status', 'paid')->count();
        $totalCount = Invoice::count();

        return response()->json([
            'invoices' => $invoices,
            'stats' => [
                'total_count' => $totalCount,
                'paid_count' => $paidCount,
                'pending_cash_count' => $pendingCashCount,
                'pending_cash_cents' => (int) $pendingCashCents,
                'total_revenue_cents' => (int) $totalRevenueCents,
            ],
        ]);
    }

    public function pendingCash(): JsonResponse
    {
        $this->auditPlatformRead('platform.pending_cash_viewed');

        $pending = Invoice::query()
            ->with(['careCircle:id,name,plan_code,status'])
            ->where('payment_method', 'cash')
            ->where('status', 'pending')
            ->latest('id')
            ->get();

        return response()->json([
            'data' => $pending,
            'count' => $pending->count(),
        ]);
    }

    public function approveCash(int $id): JsonResponse
    {
        $invoice = Invoice::findOrFail($id);

        if ($invoice->payment_method !== 'cash') {
            return response()->json(['message' => 'Only cash payment invoices can be processed via cash approval.'], 422);
        }

        if ($invoice->status === 'paid') {
            return response()->json(['message' => 'This invoice has already been marked as paid.'], 422);
        }

        $invoice->status = 'paid';
        $invoice->paid_at = now();
        $invoice->save();

        $circle = CareCircle::find($invoice->care_circle_id);
        if ($circle) {
            $circle->plan_code = $invoice->plan_code;
            $circle->status = 'active';
            $circle->suspended_at = null;
            $circle->save();
        }

        $this->audit->log(
            action: 'platform.cash_payment_approved',
            actor: request()->user(),
            careCircleId: $invoice->care_circle_id,
            level: AuditLevel::Notice,
            payload: [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'amount_cents' => $invoice->amount_cents,
                'plan_code' => $invoice->plan_code,
            ],
        );

        return response()->json([
            'message' => 'Cash payment of $'.number_format($invoice->amount_cents / 100, 2).' approved. Invoice '.$invoice->invoice_number.' marked as paid and household upgraded.',
            'invoice' => $invoice->fresh(['careCircle']),
        ]);
    }

    public function rejectCash(Request $request, int $id): JsonResponse
    {
        $invoice = Invoice::findOrFail($id);

        if ($invoice->payment_method !== 'cash') {
            return response()->json(['message' => 'Only cash payment invoices can be rejected.'], 422);
        }

        $reason = $request->input('reason', 'Payment not verified during offline settlement.');

        $invoice->status = 'failed';
        $invoice->save();

        $this->audit->log(
            action: 'platform.cash_payment_rejected',
            actor: request()->user(),
            careCircleId: $invoice->care_circle_id,
            level: AuditLevel::Warning,
            payload: [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'reason' => $reason,
            ],
        );

        return response()->json([
            'message' => 'Cash settlement for invoice '.$invoice->invoice_number.' rejected.',
            'invoice' => $invoice->fresh(['careCircle']),
        ]);
    }

    public function downloadHtml(int $id): Response
    {
        $invoice = Invoice::with('careCircle')->findOrFail($id);
        $circle = $invoice->careCircle;

        $items = $invoice->line_items ?? [
            ['description' => 'CareCircle '.ucfirst($invoice->plan_code).' Plan ('.$invoice->billing_period.')', 'amount_cents' => $invoice->amount_cents, 'quantity' => 1],
        ];

        $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <title>Invoice {$invoice->invoice_number}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; margin: 40px; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
                .brand { font-size: 24px; font-weight: bold; color: #0f766e; }
                .invoice-meta { text-align: right; font-size: 14px; }
                .details { margin-top: 30px; display: flex; justify-content: space-between; }
                table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
                th { background: #f9fafb; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
                .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
                .status { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; background: #ecfdf5; color: #065f46; }
            </style>
        </head>
        <body>
            <div class='header'>
                <div>
                    <div class='brand'>CareCircle</div>
                    <p style='color: #6b7280; font-size: 12px; margin: 4px 0 0 0;'>Medication & Care Coordination Platform</p>
                </div>
                <div class='invoice-meta'>
                    <h2 style='margin: 0; font-size: 20px;'>INVOICE</h2>
                    <p style='margin: 4px 0;'><strong>Invoice #:</strong> {$invoice->invoice_number}</p>
                    <p style='margin: 4px 0;'><strong>Date:</strong> " . ($invoice->created_at ? $invoice->created_at->format('M d, Y') : '') . "</p>
                    <p style='margin: 4px 0;'><span class='status'>{$invoice->status}</span></p>
                </div>
            </div>
            <div class='details'>
                <div>
                    <h4 style='margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; color: #6b7280;'>Billed To:</h4>
                    <p style='margin: 0; font-weight: bold; font-size: 15px;'>" . htmlspecialchars($circle ? $circle->name : 'Care Circle') . "</p>
                    <p style='margin: 4px 0 0 0; color: #6b7280; font-size: 13px;'>Household Account #{$invoice->care_circle_id}</p>
                </div>
                <div style='text-align: right;'>
                    <h4 style='margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; color: #6b7280;'>Payment Method:</h4>
                    <p style='margin: 0; font-size: 14px; text-transform: capitalize;'>" . str_replace('_', ' ', $invoice->payment_method) . " " . ($invoice->last4 ? "•••• {$invoice->last4}" : '') . "</p>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style='text-align: center;'>Qty</th>
                        <th style='text-align: right;'>Price</th>
                        <th style='text-align: right;'>Amount</th>
                    </tr>
                </thead>
                <tbody>";

        foreach ($items as $item) {
            $desc = htmlspecialchars($item['description'] ?? 'Subscription');
            $qty = (int) ($item['quantity'] ?? 1);
            $amt = '$' . number_format(($item['amount_cents'] ?? $invoice->amount_cents) / 100, 2);
            $html .= "
                    <tr>
                        <td>{$desc}</td>
                        <td style='text-align: center;'>{$qty}</td>
                        <td style='text-align: right;'>{$amt}</td>
                        <td style='text-align: right;'>{$amt}</td>
                    </tr>";
        }

        $totalFormatted = '$' . number_format($invoice->amount_cents / 100, 2);
        $html .= "
                </tbody>
            </table>
            <div class='total'>
                <span>Total: {$totalFormatted} {$invoice->currency}</span>
            </div>
            <div style='margin-top: 60px; border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center; color: #9ca3af; font-size: 12px;'>
                Thank you for coordinating care with CareCircle. For billing inquiries, contact billing@carecircle.app.
            </div>
        </body>
        </html>";

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }
}
