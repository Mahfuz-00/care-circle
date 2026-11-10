<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Platform;

use App\Enums\AuditLevel;
use App\Http\Controllers\Controller;
use App\Models\FeedbackReport;
use App\Services\Auditing\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): JsonResponse
    {
        $query = FeedbackReport::query()
            ->with(['careCircle:id,name,plan_code,status', 'user:id,name,email', 'resolver:id,name'])
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->string('type')->toString()))
            ->when($request->filled('priority'), fn ($q) => $q->where('priority', $request->string('priority')->toString()))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')->toString()))
            ->when($request->boolean('open_only'), fn ($q) => $q->whereIn('status', ['new', 'triaged', 'in_progress']))
            ->latest('id');

        $reports = $query->paginate(min(100, max(1, $request->integer('per_page', 20))));

        $summary = [
            'total' => FeedbackReport::count(),
            'open' => FeedbackReport::whereIn('status', ['new', 'triaged', 'in_progress'])->count(),
            'critical_open' => FeedbackReport::where('priority', 'critical')->whereIn('status', ['new', 'triaged', 'in_progress'])->count(),
            'by_status' => [
                'new' => FeedbackReport::where('status', 'new')->count(),
                'triaged' => FeedbackReport::where('status', 'triaged')->count(),
                'in_progress' => FeedbackReport::where('status', 'in_progress')->count(),
                'resolved' => FeedbackReport::where('status', 'resolved')->count(),
                'wont_fix' => FeedbackReport::where('status', 'wont_fix')->count(),
            ],
            'by_type' => [
                'bug' => FeedbackReport::where('type', 'bug')->count(),
                'feedback' => FeedbackReport::where('type', 'feedback')->count(),
                'feature_request' => FeedbackReport::where('type', 'feature_request')->count(),
            ],
        ];

        return response()->json([
            'data' => $reports->items(),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'total' => $reports->total(),
                'per_page' => $reports->perPage(),
                'last_page' => $reports->lastPage(),
            ],
            'summary' => $summary,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $report = FeedbackReport::findOrFail($id);

        $payload = $request->validate([
            'status' => ['nullable', 'string', 'in:new,triaged,in_progress,resolved,wont_fix'],
            'priority' => ['nullable', 'string', 'in:low,normal,high,critical'],
            'resolution_note' => ['nullable', 'string', 'max:2000'],
        ]);

        if (isset($payload['status'])) {
            $report->status = $payload['status'];
            if ($payload['status'] === 'resolved') {
                $report->resolved_at = now();
                $report->resolved_by = $request->user()->id;
            }
        }

        if (isset($payload['priority'])) {
            $report->priority = $payload['priority'];
        }

        if (isset($payload['resolution_note'])) {
            $report->resolution_note = $payload['resolution_note'];
        }

        $report->save();

        $this->audit->log(
            action: 'platform.feedback_triaged',
            actor: $request->user(),
            careCircleId: $report->care_circle_id,
            level: AuditLevel::Notice,
            payload: [
                'feedback_id' => $report->id,
                'status' => $report->status,
                'priority' => $report->priority,
            ],
        );

        return response()->json([
            'message' => 'Feedback item triaged and saved.',
            'data' => $report->fresh(['careCircle', 'user', 'resolver']),
        ]);
    }
}
