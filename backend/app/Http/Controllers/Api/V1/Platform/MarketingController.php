<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Platform;

use App\Enums\AuditLevel;
use App\Http\Controllers\Controller;
use App\Models\MarketingAnnouncement;
use App\Models\MarketingLead;
use App\Models\MarketingPromotion;
use App\Services\Auditing\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MarketingController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function overview(): JsonResponse
    {
        $totalLeads = MarketingLead::count();
        $newLeads = MarketingLead::where('status', 'new')->count();
        $convertedLeads = MarketingLead::where('status', 'converted')->count();
        $activePromos = MarketingPromotion::where('is_active', true)->count();
        $activeAnnouncements = MarketingAnnouncement::where('is_active', true)->count();
        $impressions = MarketingAnnouncement::sum('impressions_count');
        $clicks = MarketingAnnouncement::sum('clicks_count');

        return response()->json([
            'data' => [
                'total_leads' => $totalLeads,
                'new_leads' => $newLeads,
                'converted_leads' => $convertedLeads,
                'lead_conversion_rate' => $totalLeads > 0 ? round(($convertedLeads / $totalLeads) * 100, 1) : 0,
                'active_promotions' => $activePromos,
                'total_redemptions' => (int) MarketingPromotion::sum('redeemed_count'),
                'active_announcements' => $activeAnnouncements,
                'total_impressions' => (int) $impressions,
                'total_clicks' => (int) $clicks,
                'banner_ctr_percent' => $impressions > 0 ? round(($clicks / $impressions) * 100, 1) : 0,
            ],
        ]);
    }

    public function promotions(Request $request): JsonResponse
    {
        $promotions = MarketingPromotion::query()
            ->when($request->filled('status'), function ($q) use ($request) {
                if ($request->string('status')->toString() === 'active') {
                    $q->where('is_active', true);
                } elseif ($request->string('status')->toString() === 'inactive') {
                    $q->where('is_active', false);
                }
            })
            ->latest('id')
            ->paginate(min(100, max(1, $request->integer('per_page', 20))));

        return response()->json([
            'data' => $promotions->items(),
            'meta' => [
                'current_page' => $promotions->currentPage(),
                'total' => $promotions->total(),
                'per_page' => $promotions->perPage(),
                'last_page' => $promotions->lastPage(),
            ],
        ]);
    }

    public function storePromotion(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'code' => ['required', 'string', 'max:32', 'unique:marketing_promotions,code'],
            'description' => ['nullable', 'string', 'max:255'],
            'discount_type' => ['required', 'string', 'in:percent,fixed_amount'],
            'discount_value' => ['required', 'integer', 'min:1'],
            'currency' => ['required', 'string', 'max:8'],
            'duration' => ['required', 'string', 'in:once,repeating,forever'],
            'max_redemptions' => ['required', 'integer', 'min:1'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $promo = MarketingPromotion::create($payload);

        $this->audit->log(
            action: 'platform.promotion_created',
            actor: $request->user(),
            careCircleId: null,
            level: AuditLevel::Notice,
            payload: ['code' => $promo->code, 'discount' => $promo->discount_value],
        );

        return response()->json(['message' => 'Promotion coupon created.', 'data' => $promo], 201);
    }

    public function togglePromotion(int $id): JsonResponse
    {
        $promo = MarketingPromotion::findOrFail($id);
        $promo->is_active = ! $promo->is_active;
        $promo->save();

        return response()->json(['message' => 'Promotion toggled.', 'data' => $promo]);
    }

    public function announcements(): JsonResponse
    {
        $announcements = MarketingAnnouncement::latest('id')->get();

        return response()->json(['data' => $announcements]);
    }

    public function storeAnnouncement(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'message' => ['required', 'string', 'max:500'],
            'cta_text' => ['nullable', 'string', 'max:60'],
            'cta_url' => ['nullable', 'string', 'max:255'],
            'tone' => ['required', 'string', 'in:primary,success,warning,info'],
            'target_audience' => ['required', 'string', 'in:all,trial_only,free_only,paying_only'],
        ]);

        $announcement = MarketingAnnouncement::create($payload);

        return response()->json(['message' => 'In-app announcement banner created.', 'data' => $announcement], 201);
    }

    public function toggleAnnouncement(int $id): JsonResponse
    {
        $announcement = MarketingAnnouncement::findOrFail($id);
        $announcement->is_active = ! $announcement->is_active;
        $announcement->save();

        return response()->json(['message' => 'Announcement toggled.', 'data' => $announcement]);
    }

    public function leads(Request $request): JsonResponse
    {
        $leads = MarketingLead::query()
            ->when($request->filled('status') && $request->string('status')->toString() !== 'all', fn ($q) => $q->where('status', $request->string('status')->toString()))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->string('search')->toString().'%';
                $q->where(function ($sub) use ($term) {
                    $sub->where('name', 'ilike', $term)->orWhere('email', 'ilike', $term);
                });
            })
            ->latest('id')
            ->paginate(min(100, max(1, $request->integer('per_page', 20))));

        return response()->json([
            'data' => $leads->items(),
            'meta' => [
                'current_page' => $leads->currentPage(),
                'total' => $leads->total(),
                'per_page' => $leads->perPage(),
                'last_page' => $leads->lastPage(),
            ],
        ]);
    }

    public function updateLead(Request $request, int $id): JsonResponse
    {
        $lead = MarketingLead::findOrFail($id);

        $payload = $request->validate([
            'status' => ['required', 'string', 'in:new,contacted,converted,disqualified'],
            'notes' => ['nullable', 'string'],
        ]);

        $lead->update($payload);

        return response()->json(['message' => 'Lead record updated.', 'data' => $lead]);
    }
}
