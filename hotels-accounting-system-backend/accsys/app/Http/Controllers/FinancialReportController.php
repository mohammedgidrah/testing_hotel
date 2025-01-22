<?php


namespace App\Http\Controllers;

use App\Models\FinancialReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinancialReportController extends Controller
{
    public function index()
    {
        $reports = FinancialReport::with('user')->get();
        return response()->json($reports);
    }

    public function store(Request $request)
    {
        $report = FinancialReport::create($request->all());
        return response()->json($report);
    }

    public function show($id)
    {
        $report = FinancialReport::with('user')->findOrFail($id);
        return response()->json($report);
    }

    public function update(Request $request, $id)
    {
        $report = FinancialReport::findOrFail($id);
        $report->update($request->all());
        return response()->json($report);
    }

    public function destroy($id)
    {
        FinancialReport::destroy($id);
        return response()->json(['message' => 'Report deleted successfully']);
    }
    public function generateReport(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        
        // Total Income
        $totalIncome = DB::table('payments')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->sum('amount_paid');
        
        // Income Breakdown
        $incomeBreakdown = DB::table('payments')
            ->select('payment_method', DB::raw('SUM(amount_paid) as total'))
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->groupBy('payment_method')
            ->get();

        // Total Expenses
        $totalExpenses = DB::table('expenses')
            ->whereBetween('expense_date', [$startDate, $endDate])
            ->sum('amount');
        
        // Expense Breakdown
        $expenseBreakdown = DB::table('expenses')
            ->select('category', DB::raw('SUM(amount) as total'))
            ->whereBetween('expense_date', [$startDate, $endDate])
            ->groupBy('category')
            ->get();

        // Net Profit
        $netProfit = $totalIncome - $totalExpenses;
        $profitMargin = $totalIncome > 0 ? ($netProfit / $totalIncome) * 100 : 0;

        // Create a response to return the financial report
        $report = [
            'total_income' => $totalIncome,
            'income_breakdown' => $incomeBreakdown,
            'total_expenses' => $totalExpenses,
            'expense_breakdown' => $expenseBreakdown,
            'net_profit' => $netProfit,
            'profit_margin' => $profitMargin,
        ];

        return response()->json($report);
    }
}

