<?php
namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index()
    {
        $expenses = Expense::with('user')->get();
        return response()->json($expenses);
    }

    public function store(Request $request)
    {
       
        // Validate incoming request data
        $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'expense_date' => 'required|date',
            'category' => 'required|string|max:100',
        ]);

        // Create the expense and set the 'created_by' field to the authenticated user's ID
        $expense = Expense::create([
            'description' => $request->description,
            'amount' => $request->amount,
            'expense_date' => $request->expense_date,
            'category' => $request->category,
            'created_by' => auth()->id(), // Automatically assigns the authenticated user's ID
        ]);

        return response()->json($expense, 201);
    }

    public function show($id)
    {
        $expense = Expense::with('user')->findOrFail($id);
        return response()->json($expense);
    }

    public function update(Request $request, $id)
    {
        // Validate incoming request data
        $request->validate([
            'description' => 'sometimes|required|string|max:255',
            'amount' => 'sometimes|required|numeric',
            'expense_date' => 'sometimes|required|date',
            'category' => 'sometimes|required|string|max:100',
            'created_by' => 'sometimes|required|integer|exists:users,id',
        ]);

        // Find and update the expense
        $expense = Expense::findOrFail($id);
        $expense->update($request->all());

        return response()->json($expense);
    }

    public function destroy($id)
    {
        $expense = Expense::find($id);
        if ($expense) {
            $expense->delete();
            return response()->json(null, 204);  // 204 No Content after successful deletion
        } else {
            return response()->json(['error' => 'Expense not found'], 404);
        }
    }
}
