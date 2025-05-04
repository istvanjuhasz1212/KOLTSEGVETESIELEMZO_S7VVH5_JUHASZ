using Microsoft.AspNetCore.Mvc;
using FullStack.Models;
using System.Collections.Generic;

namespace FullStack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BudgetController : ControllerBase
    {
        [HttpPost("analyze")]
        public IActionResult AnalyzeBudget([FromBody] BudgetData data)
        {
            if (data?.Incomes == null || data.Expenses == null)
            {
                return BadRequest("Érvénytelen bemeneti adatok");
            }

            decimal totalIncome = CalculateTotalIncome(data.Incomes);
            var (totalExpenses, expensesByCategory) = CalculateExpenses(data.Expenses);
            decimal savings = totalIncome - totalExpenses;

            var response = new BudgetSummary
            {
                TotalIncome = totalIncome,
                TotalExpenses = totalExpenses,
                Savings = savings,
                Status = savings >= 0 ? "savings" : "deficit",
                ExpensesByCategory = expensesByCategory,
                ExpenseWarning = totalExpenses > totalIncome * 0.8m ?
                    "Magas kiadási szint!" : null
            };

            return Ok(response);
        }

        private decimal CalculateTotalIncome(List<Income> incomes)
        {
            decimal total = 0;
            foreach (var income in incomes)
            {
                total += income.Amount;
            }
            return total;
        }

        private (decimal total, Dictionary<string, decimal> byCategory) CalculateExpenses(List<Expense> expenses)
        {
            decimal total = 0;
            var categories = new Dictionary<string, decimal>();

            foreach (var expense in expenses)
            {
                total += expense.Amount;

                if (categories.ContainsKey(expense.Category))
                {
                    categories[expense.Category] += expense.Amount;
                }
                else
                {
                    categories.Add(expense.Category, expense.Amount);
                }
            }

            return (total, categories);
        }
    }
}